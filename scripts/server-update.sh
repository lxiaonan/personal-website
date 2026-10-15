#!/usr/bin/env bash
set -Eeuo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
umask 022

fail() { printf '\n[错误] %s\n' "$*" >&2; exit 1; }
[ "$#" -eq 4 ] || fail '更新参数不完整，请从本机 update.cmd 启动。'
DOMAIN=$1
ARCHIVE=$2
RELEASE_ID=$3
CHECKSUM=$4
[[ "$DOMAIN" =~ ^[a-z0-9][a-z0-9.-]+[a-z0-9]$ ]] || fail '域名格式不正确。'
[[ "$RELEASE_ID" =~ ^[0-9]{8}T[0-9]{6}Z-[0-9a-f]{8}$ ]] || fail '发布版本格式错误。'
[[ "$CHECKSUM" =~ ^[0-9a-f]{64}$ ]] || fail '发布包校验码格式错误。'
[ "$(id -u)" -eq 0 ] || fail '请使用 root 账号更新。'
SITE=/var/www/$DOMAIN
[ -f "$SITE/.yunan-personal-site" ] && [ -L "$SITE/current" ] || fail '本站尚未初始化，请先运行 deploy.cmd 完整部署。'

# 与首次部署共用锁；更新只操作本站发布目录，不需要重新加载服务。
exec 9>"/var/lock/yunan-personal-site-$DOMAIN.lock"
flock -w 60 9 || fail '另一次发布正在进行，请稍后重试。'
OLD_RELEASE=$(readlink -f "$SITE/current")
case "$OLD_RELEASE" in "$SITE"/releases/*) ;; *) fail '现有发布链接不在本站 releases 目录内。';; esac
[ -d "$OLD_RELEASE" ] || fail '现有版本目录不存在。'
[ -f "$ARCHIVE" ] || fail '没有找到上传的发布包。'
printf '%s  %s\n' "$CHECKSUM" "$ARCHIVE" | sha256sum -c -
RELEASE=$SITE/releases/$RELEASE_ID
[ ! -e "$RELEASE" ] || fail '同名发布版本已经存在，请重新构建后更新。'
install -d -m 755 "$RELEASE"
tar -xzf "$ARCHIVE" -C "$RELEASE" --no-same-owner --no-same-permissions
[ -f "$RELEASE/index.html" ] || fail '发布包缺少 index.html，未切换版本。'
[ "$(cat "$RELEASE/__deploy-check.txt")" = "$RELEASE_ID" ] || fail '发布包版本不匹配，未切换版本。'
chmod -R u=rwX,go=rX "$RELEASE"

PUBLISH_PENDING=0
cleanup() {
  local code=$?
  # 切换后的健康检查失败时恢复旧版本，保留发布目录以便定位。
  if [ "$PUBLISH_PENDING" -eq 1 ]; then
    ln -s "$OLD_RELEASE" "$SITE/.rollback-$$"
    mv -Tf "$SITE/.rollback-$$" "$SITE/current"
    printf '\n[错误] 更新未通过检查，已恢复旧版本。\n' >&2
  fi
  rm -f "$SITE/.current-$$" "$SITE/.previous-$$"
  exit "$code"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
PUBLISH_PENDING=1
ln -s "$RELEASE" "$SITE/.current-$$"
mv -Tf "$SITE/.current-$$" "$SITE/current"

# 用现有 HTTPS 虚拟主机验证新文件；失败会触发旧版本恢复。
curl --fail --silent --show-error --max-time 15 --resolve "$DOMAIN:443:127.0.0.1" \
  "https://$DOMAIN/__deploy-check.txt?t=$RELEASE_ID" | grep -Fxq "$RELEASE_ID"
ln -s "$OLD_RELEASE" "$SITE/.previous-$$"
mv -Tf "$SITE/.previous-$$" "$SITE/previous"
PUBLISH_PENDING=0
printf '\nDEPLOY_RELEASE_ID=%s\n' "$RELEASE_ID"
printf '[完成] 网站文件已更新：https://%s/\n' "$DOMAIN"
