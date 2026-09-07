# Character Scene Assets

Real-time 3D avatars rendered with `@react-three/fiber` + `@react-three/drei` (`useGLTF`).

## Avatars

- `male.glb`
- `female.glb`

Free, premade Ready Player Me avatars (natural human proportions, facial features,
Wolf3D-style rig). They are MIT-licensed assets sourced from the `@readyplayerme/visage`
repository's demo assets:

- Repository: https://github.com/readyplayerme/visage
- License: MIT (Ready Player Me / visage)
- CDN reference: https://readyplayerme.github.io/visage/

`male.glb` is displayed for the `male` gender and `female.glb` for the `female` gender.
Each file is a self-contained glTF binary (~10 MB) with embedded textures, so no
runtime network requests are required to render the avatar.

> Note: the standalone `@readyplayerme/visage` package pins older three /
> @react-three/fiber / @react-three/drei versions as exact peer dependencies, which
> conflict with this project's installed versions. The avatars above are therefore
> loaded directly with the project's existing `@react-three/drei` `useGLTF` loader.
