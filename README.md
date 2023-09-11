# Darwinia Apps

## Local Dev

1. `git clone https://github.com/darwinia-network/apps.git`
2. `cd apps`
3. `yarn && yarn dev`

## How to add your portal

1. Fork this repo
2. Add your portal info to the `projects` array in [src/config/projects.ts](./src/config/projects.ts) (Please select up to `3` tags)
3. Translations can be edited in files in the [public/locales](./public//locales/) directory
4. Please put the logo file in the [src/assets/projects](./src//assets/projects/) folder
5. Then submit a pr to the `master` branch of our repo, we will review it as soon as possible
