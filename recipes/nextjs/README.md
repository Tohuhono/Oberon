This is a [Next.js](https://nextjs.org/) for [Tohuhono](https://tohuhono.com/)

# Getting started

This repository is designed for kickstarting new projects

### install

```bash
npm i
```

### set up

Copy .env.local.example to .env.local
Set all environment variables as documented in .env.local.example

### run the dev server

```bash
npm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Deploying

# Setting up a new project

## Email sending

[resend](https://resend.com/api-keys)
Create new api key with sending permission and domain scope

## Storage bucket

[uploadthing](https://uploadthing.com/)
Create new app and api key

## Database

[turso](https://docs.turso.tech/tutorials/get-started-turso-cli/)
Can be done entirely from the command line, but...
Turso requires linux, macos or wsl2 (will not work on regular windows terminal)

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso login
turso db create
turso db tokens create $DB_NAME
```
