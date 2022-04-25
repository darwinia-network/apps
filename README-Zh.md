# Darwinia Apps

## Local Dev

1. `git clone https://github.com/darwinia-network/apps.git`
2. `cd apps`
3. `yarn && yarn start`

## How to add your portal

1. Fork 这个仓库
2. 添加你的项目信息到 `apps/src/pages/Portal.tsx` 文件中的 `portalData` 数组中（请从数组末尾添加）
3. 翻译信息可以在 `apps/public/locales` 目录下的文件中编辑
4. 请把 logo 文件放到 `apps/public/image/portal/` 文件夹下
5. 然后提交一个 pr，我们会尽快进行 review
