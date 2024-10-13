---
title: "Como publicar paquetes en Github Packages"
date: "2024-10-05"
description: Aprende a publicar paquetes npm de JavaScript o Node.js en GitHub Packages y automatiza el proceso con CI/CD usando GitHub Actions.
tags:
  - npm
  - ci_cd
  - github_actions
---

- [Introducción](#-introducción)
- [Preparando la cuenta Github](#-preparando-la-cuenta-github)
- [Creando el proyecto](#-creando-el-proyecto)
- [Github Action de publicación](#️-github-action-de-publicación)
- [Configurando el proyecto para crear la release](#️-configurando-el-proyecto-para-crear-la-release)
- [Instalando del paquete](#-instalando-del-paquete)

## 📜 Introducción

Si alguna vez has copiado y pegado código entre proyectos, sabes lo tedioso que puede ser. Publicar paquetes de Node.js permite reutilizar ese código de forma eficiente y compartirlo con otros desarrolladores. Tener tu código empaquetado facilita su implementación en cualquier proyecto, asegurando consistencia sin repetir esfuerzos.

Este artículo te guía para publicar un paquete en **GitHub Packages**, aprovechando su integración con repositorios y la opción gratuita para paquetes privados en organizaciones. Además, aprenderás a automatizar el proceso mediante **GitHub Actions**, permitiendo que las publicaciones se realicen automáticamente sin pasos manuales.

## 🐙 Preparando la cuenta Github

Lo primero que debemos de hacer es [crear una organización](https://docs.github.com/es/organizations/collaborating-with-groups-in-organizations/creating-a-new-organization-from-scratch) en nuestra cuenta de Github.

Seguido de esto [crearemos un token de acceso personal](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token), también conocido como conocido como _personal access token (classic)_ que será el que utilizaremos en el workflow de las Github Actions. Al crear el token, le concederemos los siguientes permisos (**guarda el token una vez creado 😉**):

- `repo`: Full control of private repositories
  - `repo:status`: Access commit status
  - `repo_deployment`: Access deployment status
  - `public_repo`: Access public repositories
  - `repo:invite`: Access repository invitations
  - `security_events`: Read and write security events
- `write:packages`: Upload packages to GitHub Package Registry
  - `read:packages`: Download packages from GitHub Package Registry

Por último crearemos un repositorio dentro de la organización y [añadiremos el token en su configuración como un secreto](https://docs.github.com/es/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository).❗️**Recordar el nombre que le pondréis al secreto ya que con ese nombre lo llamaremos desde la Github Action, en mi caso lo llamaré `NPM_TOKEN`**❗️.

## 🚀 Creando el proyecto

Vamos a iniciar el proyecto con el comando `npm init -y`, el cual nos creará el **package.json** con lo más básico. Deberemos añadirle la siguiente configuración para que nos permita publicarlo:

- El `name` deberá ser el nombre de la organización seguido del nombre del paquete por ejemplo `@jucodev/my-utils`. De esta forma le indicamos al scope al que pertenece el paquete.
- Añadir la información del repositorio con `repository.type` y `repository.url`.
- Añadir la url del _registry_ de Github Packages con `publishConfig.registry`.
- En caso de tener **Typescript**, le pondremos como `main` la ruta correspondiente del archivo de entrada de lo compilado y añadiremos la propiedad `types` con el archivo de declaraciones que nos genera.
- Si queréis añadir **subpaths exports** para que luego al importar el paquete desde otro proyecto (por ejemplo, `import { ... } from '@jucodev/my-utils/math'`) lo tengáis mejor organizado, hay que añadir la propiedad [`exports` con los diferentes subpaths](https://nodejs.org/api/packages.html#subpath-exports) que os gustaría.

```json
{
  "name": "@jucodev/my-utils",
  "version": "1.0.0",
  "private": false,
  "main": "src/index.js",
  "type": "module",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/jucodev/my-utils.git"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

Si queréis probar que os funciona bien la configuración, podéis empaquetar el proyecto en local con `npm pack`, esto generará un comprimido **.tgz** en la raíz de vuestro proyecto. Luego lo instalamos en otro proyecto poniendo en el `package.json` el nombre de la dependencia y en vez de ponerle la versión le indicaremos la ruta donde se encuentra, por ejemplo:

```json
{
  "dependencies": {
    "@jucodev/my-utils": "file:../my-utils/jucodev-my-utils-1.0.0.tgz"
  }
}
```

Para este ejemplo crearemos algo básico en `src/index.js` para exportarlo:

```javascript
// src/index.js

export function sum(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
```

## ⬆️ Github Action de publicación

Ahora crearemos la **Github Action** que nos permita publicar y configuraremos como trigger cualquier cambio que se haga sobre la rama `main`. Para ello crearemos `github/workflows/npm-publish.yml` con lo siguiente:

```yaml
name: Publish NPM package

on:
  push:
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup node
        # El step action de "setup-node" crea el fichero .npmrc en el runner
        uses: actions/setup-node@v3
        with:
          node-version: "20.x"
          # url del registro de Github Packages, configurado como "publishConfig.registry"
          registry-url: "https://npm.pkg.github.com"
          # scope puesto en el "name" del package.json
          scope: "@jucodev"

      - name: Install dependencies
        run: |
          npm ci

      # Este step action solo es necesario si utiliza Typescript
      - name: Build package
        run: |
          npm run build

      - name: Publish package
        run: |
          npm publish
        env:
          # nombre del secreto configurado en el repositorio, en mi caso le puse "NPM_TOKEN"
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

El step action de [`actions/setup-node@v3`](https://github.com/actions/setup-node) crea el fichero **.npmrc** automáticamente al pasarle como parámetros el `registry-url` y `scope`. Este fichero contiene la configuración necesaria para poder publicar e instalar paquetes. Si quieres saber más sobre este fichero te dejo [aquí la documentación](https://docs.npmjs.com/cli/v10/configuring-npm/npmrc).

A partir de ahora, cada vez que subamos algo nuevo a la rama `main` nos generará un paquete nuevo con la versión indicada en el **package.json**, pero esto se puede convertir en un trabajo tedioso ya que tendremos que estar actualizando la versión manualmente y puede dar a olvidos. En el siguiente paso vamos a ver como podemos automatizar la generación de versiones ([versionado semántico](https://docs.npmjs.com/about-semantic-versioning)) para que dependiendo de lo que desarrollemos, creemos version `major`, `minor` o `patch`.

## ⚙️ Configurando el proyecto para crear la release

Vamos, ya queda poco para dejarlo todo automatizado y centrarnos en el desarrollo 😎. En este paso veremos como podemos automatizar:

- Versionado semántico a partir de los [**commits semánticos**](https://www.conventionalcommits.org/en/v1.0.0/).
- Creación de un **changelog**.
- Generación de [**tags**](https://git-scm.com/book/en/v2/Git-Basics-Tagging) con la versión correspondiente.
- Creación de una [**release**](https://docs.github.com/es/repositories/releasing-projects-on-github/about-releases).

Antes de comenzar, os recomiendo tener alguna herramiento de hooks para git como [husky](https://typicode.github.io/husky/) y validar que los commits que escribís cumplen las reglas de los commits semánticos.

Al lío con la configuración, empezaremos instalando las siguientes dependencias de [`@semantic-release`](https://semantic-release.gitbook.io/semantic-release) en nuestro proyecto:

- [@semantic-release/changelog](https://github.com/semantic-release/changelog).
- [@semantic-release/commit-analyzer](https://github.com/semantic-release/commit-analyzer).
- [@semantic-release/git](https://github.com/semantic-release/git).
- [@semantic-release/github](https://github.com/semantic-release/github).
- [@semantic-release/npm](https://github.com/semantic-release/npm).
- [@semantic-release/release-notes-generator](https://github.com/semantic-release/release-notes-generator).

```bash
npm i -D @semantic-release/changelog @semantic-release/commit-analyzer @semantic-release/git @semantic-release/github @semantic-release/npm @semantic-release/release-notes-generator
```

Lo siguiente será añadir la configuración de `@semantic-release` en nuestro **package.json**.

- Omitimos la publicación del paquete para respetar la responsabilidad de cada Github Action.
- Personalizamos el mensaje del commit para cuando lo cree con la nueva versión y el changelog. Seguirá la siguiente forma: `chore(release): ${nextRelease.version} \n\n${nextRelease.notes}`.

```json
{
  "release": {
    "branches": [
      "main"
    ],
    "repositoryUrl": "https://github.com/jucodev/my-utils.git",
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      [
        "@semantic-release/npm",
        {
          "npmPublish": false
        }
      ],
      [
        "@semantic-release/git",
        {
          "assets": [
            "package.json",
            "CHANGELOG.md"
          ],
          "message": "chore(release): ${nextRelease.version} \n\n${nextRelease.notes}"
        }
      ],
      "@semantic-release/github"
    ]
  }
}
```

Ahora crearemos la Github Action en `.github/workflows/release.yml`. Su finalidad será crear un release ejecutando toda la configuración que hemos añadido de `@semantic-release`.

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions: write-all
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "lts/*"
      - name: Install dependencies
        run: npm ci
      - name: Release
        env:
          # Razón por la cual no debbemos de usar el GITHUB_TOKEN: https://stackoverflow.com/questions/69063452/github-actions-on-release-created-workflow-trigger-not-working
          GITHUB_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

Ahora que ya estamos creando la release, cambiaremos el trigger de la Github Action de publicar paquetes para que se ejecute solo cuando se haya creado una release:

```yaml
name: Publish NPM package

on:
  release:
    types: [published]
# ...
```

Si habéis publicado un paquete con la anterior Github Action, deberéis de **incrementar la versión del `package.json`** manualmente la primera vez, ya que como detecta que todavía no existen releases, creará una con la versión actual que tiene.

**Nota**: si queremos sacar un versión `major` deberemos de escribir un commit que contenga un `BREAKING CHANGE`, os dejo aquí un ejemplo:

```bash
git commit -m "feat: implement new authentication system" -m "BREAKING CHANGE: The old authentication API has been removed. The new system requires clients to use OAuth2."
```

Enhorabuena 🥳, ya tenemos todo integrado con **CI/CD**. Por último haremos la prueba de instalación del paquete.

## 📦 Instalando del paquete

Llego el momento, vamos a comprobar si toda esta configuración ha merecido la pena. Para instalar el paquete debemos de añadir el token (_personal access token_) creado anteriormente en Github y el registry en nuestra configuración de `npm`. En mi caso utilizo el archivo `.npmrc` global pero puedes segmentarlo únicamente a cada proyecto creando el `.npmrc` en la ráiz de cada proyecto.

Para añadir en el `.npmrc` gblobal ejecutaremos los siguientes comandos:

```shell
# Ponemos el scope de nuestra organización seguido de la url del registry de Github Packages
# npm config set <scope>:registry=https://npm.pkg.github.com/
npm config set @jucodev:registry=https://npm.pkg.github.com/

# Ponemos la autenticación con el "personal access token" generado en Github
npm config set //npm.pkg.github.com/:_authToken=<token>
```

Una vez configurado, hacemos la instalación del paquete desde otro proyecto:

```shell
npm i @jucodev/my-utils
```

![package installation](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3hoaGgzZTI3cm5jM3U4Ymd2cTZxZm5sa3p6M3c1OWk1dmo0dWs2NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1g2JyW7p6mtZc6bOEY/giphy.gif)

**¡Enhorabuena, ya tienes automatizada la publicación del paquete para centrarte en el desarrollo!**

Espero que te haya resultado interesante, muchas gracias 🤗.

# 🤜 🤛
