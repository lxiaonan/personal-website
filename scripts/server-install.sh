#!/usr/bin/env bash
set -Eeuo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export DEBIAN_FRONTEND=noninteractive
umask 022

fail() { printf '\n[错误] %s\n' "$*" >&2; exit 1; }
log() { printf '\n[部署] %s\n' "$*"; }
write_config() {
  local tls=$1
  printf '%s\n' "$MARKER"
  cat <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    charset utf-8;
    location ^~ /.well-known/acme-challenge/ {
        root $SITE/acme;
        default_type text/plain;
        try_files \$uri =404;
    }
NGINX
  if [ "$tls" -eq 1 ]; then
    cat <<NGINX
    location / { return 301 https://$DOMAIN\$request_uri; }
}
server {
    listen 443 ssl;
    server_name $DOMAIN;
    ssl_certificate $CERT/fullchain.pem;
    ssl_certificate_key $CERT/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    charset utf-8;
NGINX
  fi
  cat <<NGINX
    root $SITE/current;
    index index.html;
    autoindex off;
    add_header X-Content-Type-Options nosniff always;
    location ^~ /_astro/ {
        try_files \$uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header X-Content-Type-Options nosniff always;
    }
    location ~ /\\.(?!well-known/) { deny all; }
    location / {
        try_files \$uri \$uri/ =404;
        add_header Cache-Control "no-cache" always;
        add_header X-Content-Type-Options nosniff always;
    }
}
NGINX
}


# 本地校验模板专用：只向标准输出渲染配置，不执行服务器安装。
if [ "$#" -gt 0 ] && [ "$1" = '--render-nginx' ]; then
  [ "$#" -eq 3 ] || fail '配置渲染参数错误。'
  DOMAIN=$2
  [[ "$DOMAIN" =~ ^[a-z0-9][a-z0-9.-]+[a-z0-9]$ ]] || fail '域名格式不正确。'
  [[ "$3" = 0 || "$3" = 1 ]] || fail 'TLS 模式只能是 0 或 1。'
  SITE=/var/www/$DOMAIN
  CERT=/etc/letsencrypt/live/$DOMAIN
  MARKER='# Managed by yunan-personal-site'
  write_config "$3"
  exit 0
fi

[ "$#" -eq 5 ] || fail '安装脚本参数不完整。请从本机 deploy.cmd 启动。'
DOMAIN=$1
EMAIL=$2
ARCHIVE=$3
RELEASE_ID=$4
CHECKSUM=$5
[[ "$DOMAIN" =~ ^[a-z0-9][a-z0-9.-]+[a-z0-9]$ ]] || fail '域名格式不正确。'
[ "$(id -u)" -eq 0 ] || fail '请使用 root 账号部署。'
[ -r /etc/os-release ] || fail '暂只支持 Ubuntu / Debian。'
. /etc/os-release
case "$ID" in ubuntu|debian) ;; *) fail '暂只支持 Ubuntu / Debian，请勿在其他系统强行运行。';; esac
command -v systemctl >/dev/null || fail '需要使用 systemd 的 Ubuntu / Debian 服务器。'

SITE=/var/www/$DOMAIN
STATE=/var/lib/yunan-personal-site/$DOMAIN
CONF=/etc/nginx/conf.d/$DOMAIN.conf
CERT=/etc/letsencrypt/live/$DOMAIN
MARKER='# Managed by yunan-personal-site'
OLD_RELEASE=''
PUBLISH_PENDING=0
CONFIG_BACKUP=''
CONFIG_EXISTED=0
CONFIG_REPLACED=0
DUMP=''
DIAG=''

restore_release() {
  if [ "$PUBLISH_PENDING" -eq 1 ]; then
    if [ -n "$OLD_RELEASE" ]; then
      ln -s "$OLD_RELEASE" "$SITE/.rollback-$$"
      mv -Tf "$SITE/.rollback-$$" "$SITE/current"
    elif [ -L "$SITE/current" ]; then
      rm -f "$SITE/current"
    fi
  fi
  PUBLISH_PENDING=0
}
on_error() {
  local code=$?
  trap - ERR
  restore_release || true
  printf '\n[错误] 部署在第 %s 行中断（退出码 %s），没有报告成功。\n' "$1" "$code" >&2
  exit "$code"
}
restore_config() {
  if [ "$CONFIG_REPLACED" -eq 1 ] && [ -n "$CONFIG_BACKUP" ]; then
    if [ "$CONFIG_EXISTED" -eq 1 ]; then cp -a "$CONFIG_BACKUP" "$CONF"; else rm -f "$CONF"; fi
    CONFIG_REPLACED=0
    nginx -t && systemctl reload nginx || true
  fi
}
cleanup() {
  restore_release || true
  restore_config || true
  [ -z "$DUMP" ] || rm -f "$DUMP"
  [ -z "$DIAG" ] || rm -f "$DIAG"
  [ -z "$CONFIG_BACKUP" ] || rm -f "$CONFIG_BACKUP"
}
trap 'on_error "$LINENO"' ERR
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

# 只锁定本域名的发布，不会停止其他站点或已有应用。
command -v flock >/dev/null || fail '服务器缺少 util-linux 的 flock 命令。'
exec 9>"/var/lock/yunan-personal-site-$DOMAIN.lock"
flock -w 60 9 || fail '另一次发布正在进行，请稍后重试。'

# 避免在其他 HTTP 服务或容器代理占用端口时接管其监听端口。
if command -v ss >/dev/null; then
  while IFS= read -r listener; do
    if [ -n "$listener" ] && [[ "$listener" != *'"nginx"'* ]]; then
      fail '80 或 443 端口已有非 Nginx 服务。请先确认现有服务的反向代理方式；脚本未停止该服务。'
    fi
  done < <(ss -H -ltnp '( sport = :80 or sport = :443 )')
fi

MISSING=''
for tool in nginx certbot curl openssl python3; do
  if ! command -v "$tool" >/dev/null; then MISSING="$MISSING $tool"; fi
done
if [ -n "$MISSING" ]; then
  log "安装缺少的软件：$MISSING"
  apt-get -o Acquire::Retries=2 -o Acquire::http::Timeout=30 -o Acquire::https::Timeout=30 update
  apt-get -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold install -y --no-install-recommends $MISSING
fi

if [ -d "$SITE" ] && [ ! -f "$SITE/.yunan-personal-site" ]; then
  if [ -n "$(find "$SITE" -mindepth 1 -maxdepth 1 -print -quit)" ]; then
    fail "$SITE 已有其他内容且未标记为本脚本管理，已停止覆盖。"
  fi
fi
install -d -m 755 "$SITE" "$SITE/releases" "$SITE/acme" /etc/nginx/conf.d
install -d -m 700 "$STATE"
printf '%s\n' "$MARKER" > "$SITE/.yunan-personal-site"
if [ -e "$SITE/current" ] && [ ! -L "$SITE/current" ]; then
  fail "$SITE/current 不是本脚本的发布软链接，已停止覆盖。"
fi
if [ -L "$SITE/current" ]; then
  OLD_RELEASE=$(readlink -f "$SITE/current")
  case "$OLD_RELEASE" in "$SITE"/releases/*) ;; *) fail '现有发布链接不在本站 releases 目录内。';; esac
  [ -d "$OLD_RELEASE" ] || fail '现有发布链接指向不存在的目录。'
fi
if [ -e "$CONF" ] && [ "$(head -n 1 "$CONF")" != "$MARKER" ]; then
  fail "$CONF 不是本脚本创建的配置，已停止覆盖。"
fi

# 检查真实加载的配置，发现同域名在其他虚拟主机里时停止，避免影响已有站点。
DUMP=$(mktemp "$STATE/nginx-dump.XXXXXXXX")
DIAG=$(mktemp "$STATE/nginx-diagnostic.XXXXXXXX")
nginx -T > "$DUMP" 2> "$DIAG" || { cat "$DIAG" >&2; fail '服务器原有 Nginx 配置检查失败。'; }
python3 - "$DUMP" "$DOMAIN" "$CONF" <<'PY'
import os
import re
import sys
from pathlib import Path
text = Path(sys.argv[1]).read_text(encoding='utf-8', errors='replace')
domain, managed = sys.argv[2], os.path.realpath(sys.argv[3])
code = re.sub(r'(?m)#.*$', '', text)
if not re.search(r'\binclude\s+[^;]*/etc/nginx/conf\.d/\*\.conf[^;]*;', code):
    raise SystemExit('主 Nginx 配置没有加载 /etc/nginx/conf.d/*.conf，请先确认站点配置入口。')
parts = re.split(r'^# configuration file (.+):\s*$', text, flags=re.MULTILINE)
for index in range(1, len(parts), 2):
    filename, body = parts[index], parts[index + 1]
    body = re.sub(r'(?m)#.*$', '', body)
    for names in re.findall(r'\bserver_name\s+([^;]+);', body):
        if domain in names.split() and os.path.realpath(filename) != managed:
            raise SystemExit('域名已经配置在其他 Nginx 文件中：' + filename + '。请先确认迁移方式，脚本没有覆盖它。')
PY

have_certificate() {
  [ -s "$CERT/fullchain.pem" ] && [ -s "$CERT/privkey.pem" ] &&
    openssl x509 -in "$CERT/fullchain.pem" -noout -checkhost "$DOMAIN" >/dev/null 2>&1 &&
    openssl x509 -in "$CERT/fullchain.pem" -noout -checkend 0 >/dev/null 2>&1
}

reload_or_start_nginx() {
  if systemctl is-active --quiet nginx; then systemctl reload nginx; else systemctl start nginx; fi
}

activate_config() {
  local tls=$1
  local candidate
  candidate=$(mktemp /etc/nginx/conf.d/.yunan-site.XXXXXXXX)
  CONFIG_BACKUP=$(mktemp "$STATE/nginx-backup.XXXXXXXX")
  CONFIG_EXISTED=0
  if [ -e "$CONF" ]; then
    cp -a "$CONF" "$CONFIG_BACKUP"
    CONFIG_EXISTED=1
  fi
  write_config "$tls" > "$candidate"
  chmod 644 "$candidate"
  mv -f "$candidate" "$CONF"
  CONFIG_REPLACED=1
  if nginx -t && reload_or_start_nginx; then
    CONFIG_REPLACED=0
    rm -f "$CONFIG_BACKUP"
    CONFIG_BACKUP=''
  else
    if [ "$CONFIG_EXISTED" -eq 1 ]; then mv -f "$CONFIG_BACKUP" "$CONF"; else rm -f "$CONF" "$CONFIG_BACKUP"; fi
    CONFIG_BACKUP=''
    CONFIG_REPLACED=0
    nginx -t && systemctl reload nginx || true
    return 1
  fi
}

if [ "$ARCHIVE" != '-' ]; then
  [[ "$RELEASE_ID" =~ ^[0-9]{8}T[0-9]{6}Z-[0-9a-f]{8}$ ]] || fail '发布版本格式错误。'
  [[ "$CHECKSUM" =~ ^[0-9a-f]{64}$ ]] || fail '发布包校验码格式错误。'
  [ -f "$ARCHIVE" ] || fail '没有找到上传的网站压缩包。'
  printf '%s  %s\n' "$CHECKSUM" "$ARCHIVE" | sha256sum -c -
  RELEASE=$SITE/releases/$RELEASE_ID
  [ ! -e "$RELEASE" ] || fail '同名发布版本已经存在，请重新构建后部署。'
  install -d -m 755 "$RELEASE"
  tar -xzf "$ARCHIVE" -C "$RELEASE" --no-same-owner --no-same-permissions
  [ -f "$RELEASE/index.html" ] || fail '发布包没有 index.html，已停止切换版本。'
  [ "$(cat "$RELEASE/__deploy-check.txt")" = "$RELEASE_ID" ] || fail '发布包版本标识不匹配。'
  chmod -R u=rwX,go=rX "$RELEASE"
  PUBLISH_PENDING=1
  ln -s "$RELEASE" "$SITE/.current-$$"
  mv -Tf "$SITE/.current-$$" "$SITE/current"
  log "已切换网站版本：$RELEASE_ID"
else
  [ -n "$OLD_RELEASE" ] || fail '还没有已部署的网站，请先执行一次完整部署。'
  RELEASE_ID=$(cat "$SITE/current/__deploy-check.txt")
fi

TLS=0
if have_certificate; then TLS=1; fi
activate_config "$TLS"
systemctl enable nginx >/dev/null
# 本机请求只验证域名虚拟主机，不受其他默认站点影响。
if [ "$TLS" -eq 1 ]; then
  curl --fail --silent --show-error --max-time 15 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/__deploy-check.txt" | grep -Fxq "$RELEASE_ID"
else
  curl --fail --silent --show-error --max-time 15 --resolve "$DOMAIN:80:127.0.0.1" "http://$DOMAIN/__deploy-check.txt" | grep -Fxq "$RELEASE_ID"
fi
PUBLISH_PENDING=0
if [ -n "$OLD_RELEASE" ] && [ "$ARCHIVE" != '-' ]; then
  ln -s "$OLD_RELEASE" "$SITE/.previous-$$"
  mv -Tf "$SITE/.previous-$$" "$SITE/previous"
fi

# 只在 UFW 已启用时增加本站所需端口，不启用防火墙或修改 SSH 规则。
if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
  ufw allow 80/tcp
  ufw allow 443/tcp
fi

log '申请或复用 Let’s Encrypt 证书。域名必须指向本机，公网 80 端口必须可访问。'
issue_certificate() {
  certbot certonly --webroot --webroot-path "$SITE/acme" \
    --domain "$DOMAIN" --cert-name "$DOMAIN" \
    --non-interactive --agree-tos --keep-until-expiring "$@"
}
CERT_OK=0
if [ -n "$EMAIL" ]; then
  if issue_certificate --email "$EMAIL"; then CERT_OK=1; fi
else
  if issue_certificate --register-unsafely-without-email; then CERT_OK=1; fi
fi
if [ "$CERT_OK" -ne 1 ]; then
  printf '\n[HTTPS 未完成] 网页已发布，但证书申请失败。\n请检查 DNS A/AAAA 记录、安全组入方向 80/443、域名代理与 Certbot 上方错误。\n修正后执行：node scripts/deploy.mjs --https-only\n' >&2
  exit 3
fi
have_certificate || fail '证书申请返回后未找到本站可用证书。'
activate_config 1

install -d -m 755 /etc/letsencrypt/renewal-hooks/deploy
HOOK=/etc/letsencrypt/renewal-hooks/deploy/yunan-personal-site-$DOMAIN.sh
cat > "$HOOK" <<HOOKSCRIPT
#!/usr/bin/env bash
# Managed by yunan-personal-site
set -eu
case " \$RENEWED_DOMAINS " in
  *" $DOMAIN "*) nginx -t && systemctl reload nginx ;;
esac
HOOKSCRIPT
chmod 755 "$HOOK"
systemctl enable --now certbot.timer
systemctl is-active --quiet certbot.timer || fail '证书已安装，但 Certbot 自动续期定时器没有启动。'
curl --fail --silent --show-error --max-time 15 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/__deploy-check.txt" | grep -Fxq "$RELEASE_ID"
printf '\nDEPLOY_RELEASE_ID=%s\n' "$RELEASE_ID"
printf '[完成] https://%s/ 已配置，HTTP 自动跳转 HTTPS，证书自动续期已启用。\n' "$DOMAIN"
