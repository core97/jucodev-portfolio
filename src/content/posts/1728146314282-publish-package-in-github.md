---
title: "Como publicar un paquete en Github Packages"
date: "2024-10-05"
description: "Pepe es el mejor"
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

Si alguna vez te has encontrado copiando y pegando código entre proyectos, sabes lo tedioso que puede ser. Publicar paquetes de Node.js no solo te permite reutilizar ese código de forma más eficiente, sino que también te da la oportunidad de compartir tus soluciones con otros desarrolladores o incluso entre diferentes equipos de trabajo. Al tener tu código empaquetado y disponible, puedes implementarlo fácilmente en cualquier proyecto sin tener que repetir esfuerzo, asegurando que todo funcione de manera consistente.

En este artículo, te voy a guiar paso a paso para publicar un paquete en **GitHub Packages**. ¿Por qué GitHub? Bueno, además de estar integrado con tus repositorios, ofrece la ventaja de una capa gratuita para publicar paquetes privados a partir de una organización. Esto es genial si quieres mantener tus paquetes privados dentro de tu equipo sin tener que gastar dinero en ello.

Pero eso no es todo. También veremos cómo automatizar todo el proceso usando **buenas prácticas de CI/CD**. Utilizaremos **GitHub Actions** para hacer que cada vez que quieras publicar una nueva versión del paquete, el proceso ocurra de manera automática y fluida, sin complicaciones ni pasos manuales. La idea es que, una vez configurado, todo se gestione solo: desde la creación de releases hasta la publicación final.

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

- El `name` deberá ser el nombre de la organización seguido del nombre del paquete por ejemplo `@jucodev/my-utils`. De esta forma le indicamos al scope al que pertenece el paquete. Nota: el nombre de la organización debe ser en **snake case**.
- Añadir la información del repositorio con `repository.type` y `repository.url`.
- Añadir la url del _registry_ de Github Packages con `publishConfig.registry`.
- Si estáis utilizando solamente **Javascript**, deberéis de crear la propiedad `types` con las declaraciones de lo que se exporta desde el archivo de entrada, en este caso `src/index.js`. Esto es tan simple como crear otro archivo dentro de `src` llamado `index.d.ts`, el cual pondremos `export * from 'index'`. Y ahora en `types` le ponemos la ruta de `src/index.d.ts`.
- En caso de tener **Typescript**, le pondremos como `main` la ruta correspondiente del archivo de entrada de lo compilado y añadiremos la propiedad `types` con el archivo de declaraciones que nos genera.
- Si queréis añadir **subpaths** para que luego al importar el paquete desde otro proyecto (por ejemplo, `import { ... } from '@jucodev/my-utils/math'`) lo tengáis mejor organizado, hay que añadir la propiedad [`exports` con los diferentes subpaths](https://nodejs.org/api/packages.html#subpath-exports) que os gustaría.

```json
{
  "name": "@jucodev/my-utils",
  "version": "1.0.0",
  "private": false,
  "main": "src/index.js",
  "type": "module",
  "types": "src/index.d.ts",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/jucodev/my-utils.git"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": ""
}
```

Para este ejemplo crearemos algo básico en `src/index.js` para exportarlo:

```javascript
// src/index.js

export function sum(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  return a / b;
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
  ...,
    "release": {
    "branches": [
      "main"
    ],
    "repositoryUrl": "https://github.com/crazy-grey/react-ui-kit.git",
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

**Nota**: si queremos sacar un versión `major` deberemos de escribir un commit que contenga un `BREAKING CHANGE`, os dejo aquí un ejemplo:

```bash
git commit -m "feat: implement new authentication system" -m "BREAKING CHANGE: The old authentication API has been removed. The new system requires clients to use OAuth2."
```

## 📦 Instalando del paquete

- Configurar ("npm config set ...") el token creado anteriormente en nuestro local para poder instalar el paquete
- Hacer un "npm i" del paquete
