# Ready Player Me — visage demo avatars

- Files: `public/character-scene/male.glb`, `female.glb`
- Repository: https://github.com/readyplayerme/visage
- License: MIT
- CDN reference: https://readyplayerme.github.io/visage/
- Used as: base models for `character-01` (female) and `character-02` (male)
- Notes: self-contained GLB binaries with embedded textures; no runtime
  network fetch needed. Skeletons present, no embedded animation clips —
  animation runs through `CharacterAnimationController` (procedural today,
  GLB clips tomorrow).
