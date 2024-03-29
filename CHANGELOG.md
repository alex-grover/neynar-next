# Changelog

## [0.3.3](https://github.com/alex-grover/neynar-next/compare/v0.3.2...v0.3.3) (2024-01-14)


### Bug Fixes

* allow next 14 ([2f6af2b](https://github.com/alex-grover/neynar-next/commit/2f6af2bd8bc0013827db1932e6bea7fe1e71ca0e))

## [0.3.2](https://github.com/alex-grover/neynar-next/compare/v0.3.1...v0.3.2) (2024-01-14)


### Bug Fixes

* update embed for cast ID ([bc1cbfd](https://github.com/alex-grover/neynar-next/commit/bc1cbfde2e31677688e13a6df2cd9974c1515ef3))

## [0.3.1](https://github.com/alex-grover/neynar-next/compare/v0.3.0...v0.3.1) (2023-10-29)


### Features

* add reactions and recasts ([2f56923](https://github.com/alex-grover/neynar-next/commit/2f569233aef774c58b56bb31e983cce5199cfe0b))

## [0.3.0](https://github.com/alex-grover/neynar-next/compare/v0.2.8...v0.3.0) (2023-10-24)


### ⚠ BREAKING CHANGES

* User APIs now return v2 user shape

### Features

* align type for v1 and v2 users ([5ecaea3](https://github.com/alex-grover/neynar-next/commit/5ecaea33fbc4d8dc761da336420e0b6b14dfb04f)), closes [#36](https://github.com/alex-grover/neynar-next/issues/36)

## [0.2.8](https://github.com/alex-grover/neynar-next/compare/v0.2.7...v0.2.8) (2023-10-23)


### Bug Fixes

* use correct cast type ([234c33a](https://github.com/alex-grover/neynar-next/commit/234c33a7429b2b032dae302548e8ed18739a100d))

## [0.2.7](https://github.com/alex-grover/neynar-next/compare/v0.2.6...v0.2.7) (2023-10-14)


### Features

* add get cast information api ([13ef187](https://github.com/alex-grover/neynar-next/commit/13ef1874c733cd3419c3d99de4c2007f5706d82e))
* add get casts in thread api ([5d34c4b](https://github.com/alex-grover/neynar-next/commit/5d34c4bcfc33db41691b39eb2455fcc41f200556))
* add get mentions and replies api ([37a157d](https://github.com/alex-grover/neynar-next/commit/37a157d0f62685971e701d436236445ac922cb7c))

## [0.2.6](https://github.com/alex-grover/neynar-next/compare/v0.2.5...v0.2.6) (2023-10-06)


### Bug Fixes

* use compatible fid list query param format ([f206751](https://github.com/alex-grover/neynar-next/commit/f2067511383c756ae3c82b20613f9800b606378a))

## [0.2.5](https://github.com/alex-grover/neynar-next/compare/v0.2.4...v0.2.5) (2023-10-04)


### Features

* add type to post cast ([8bc3f84](https://github.com/alex-grover/neynar-next/commit/8bc3f84933f9d54b4e2739b3c2c38c3592c749fe))

## [0.2.4](https://github.com/alex-grover/neynar-next/compare/v0.2.3...v0.2.4) (2023-09-27)


### Bug Fixes

* don't hardcode reply count ([16a2031](https://github.com/alex-grover/neynar-next/commit/16a203159d396258c2fe867fb09bc6fa4d83eec4))

## [0.2.3](https://github.com/alex-grover/neynar-next/compare/v0.2.2...v0.2.3) (2023-09-27)


### Features

* get user by username ([b63edb2](https://github.com/alex-grover/neynar-next/commit/b63edb220facc1f440b0e932ffd5478b3415c607))

## [0.2.2](https://github.com/alex-grover/neynar-next/compare/v0.2.1...v0.2.2) (2023-09-26)


### Features

* allow casting with embeds and parent ([f5aadda](https://github.com/alex-grover/neynar-next/commit/f5aadda29c4185757980d1b562d3828466d1d9e4))

## [0.2.1](https://github.com/alex-grover/neynar-next/compare/v0.2.0...v0.2.1) (2023-09-26)


### Features

* post and delete casts ([d1cc4e3](https://github.com/alex-grover/neynar-next/commit/d1cc4e35d7ac5633b2cb533d72f3bd625c8f0e2d))

## [0.2.0](https://github.com/alex-grover/neynar-next/compare/v0.1.3...v0.2.0) (2023-09-24)


### ⚠ BREAKING CHANGES

* The return type of `getUserByFid` no longer contains the `viewerContext` field unless the `viewer` parameter is passed.

### Features

* allow passing viewer FID to user API ([b10e6bf](https://github.com/alex-grover/neynar-next/commit/b10e6bfad311a0e1cefa77b7f51e6e3a03be15ba))

## [0.1.3](https://github.com/alex-grover/neynar-next/compare/v0.1.2...v0.1.3) (2023-09-24)


### Features

* add reaction methods ([0ccefc7](https://github.com/alex-grover/neynar-next/commit/0ccefc7549b57ed809ce25f0e04d2164797ec765))

## [0.1.2](https://github.com/alex-grover/neynar-next/compare/v0.1.1...v0.1.2) (2023-09-24)


### Features

* add feed by fid list fetching ([2ea672d](https://github.com/alex-grover/neynar-next/commit/2ea672d87a39526b1831644e709176d35ee10630))

## [0.1.1](https://github.com/alex-grover/neynar-next/compare/v0.1.0...v0.1.1) (2023-09-23)


### Features

* add user by fid fetching ([98b8a54](https://github.com/alex-grover/neynar-next/commit/98b8a5420d967ae2c736640bbbe608a253fce844))

## [0.1.0](https://github.com/alex-grover/neynar-next/compare/v0.0.7...v0.1.0) (2023-09-23)


### ⚠ BREAKING CHANGES

* useNeynar hook renamed to useSigner

### Features

* implement feed fetching ([064f2b9](https://github.com/alex-grover/neynar-next/commit/064f2b965dcca0198acbcfc22d885e1096121ff3))


### Code Refactoring

* rename hook ([28a4dbb](https://github.com/alex-grover/neynar-next/commit/28a4dbb112525103866c54bef8d63b15e674632f))

## [0.0.7](https://github.com/alex-grover/neynar-next/compare/v0.0.6...v0.0.7) (2023-09-23)


### Bug Fixes

* correctly set header ([5f35100](https://github.com/alex-grover/neynar-next/commit/5f35100f38a3e14b6d218126272e8dc6b293b820))

## [0.0.6](https://github.com/alex-grover/neynar-next/compare/v0.0.5...v0.0.6) (2023-09-23)


### Features

* start with initial loading state ([af88fde](https://github.com/alex-grover/neynar-next/commit/af88fde722177104aa73a283239f0c2c4ce67688))

## [0.0.5](https://github.com/alex-grover/neynar-next/compare/v0.0.4...v0.0.5) (2023-09-23)


### Bug Fixes

* apply jsx transform during build ([fddf5c1](https://github.com/alex-grover/neynar-next/commit/fddf5c11a305e6b830d8fa622555ef82c95788b6))

## [0.0.4](https://github.com/alex-grover/neynar-next/compare/v0.0.3...v0.0.4) (2023-09-23)


### Bug Fixes

* add client directive to index file ([056212c](https://github.com/alex-grover/neynar-next/commit/056212c9723a8eb87264899e542e5cd13cadb4b4))

## [0.0.3](https://github.com/alex-grover/neynar-next/compare/v0.0.2...v0.0.3) (2023-09-23)


### Bug Fixes

* add subpath export ([0e8d5c0](https://github.com/alex-grover/neynar-next/commit/0e8d5c0762538290cbfccaac6cee7dc65d96e80e))

## [0.0.2](https://github.com/alex-grover/neynar-next/compare/v0.0.1...v0.0.2) (2023-09-23)


### Bug Fixes

* fix import path ([ee3dd22](https://github.com/alex-grover/neynar-next/commit/ee3dd227a27326c0d64d17ea9b63389898aac1ac))

## 0.0.1 (2023-09-23)


### Features

* implement sign in ([972e8b4](https://github.com/alex-grover/neynar-next/commit/972e8b4ac498d329e73e7dbbc390ed8c04f87639))
