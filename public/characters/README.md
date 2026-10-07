# Characters — source of truth

Launch catalog: exactly two free characters.

- `character-01` (Aria) → base model `/character-scene/female.glb`
- `character-02` (Kai) → base model `/character-scene/male.glb`

Both share `rigId: humanoid-v1` so animations and equipment stay compatible.

## Layout

```
public/characters/
├── base/character-01/pointer.json
├── base/character-02/pointer.json
├── items/<slot>/pointer.json
├── animations/manifest.json
└── licenses/
    ├── README.md
    ├── ready-player-me-NOTICE.md
    └── quaternius-CANDIDATE.md
```

Base GLBs stay in `public/character-scene/` (no 20 MB duplication).
Pointer files record the resolved runtime URL + rig + version.
