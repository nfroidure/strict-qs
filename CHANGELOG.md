## [4.1.1](https://github.com/nfroidure/strict-qs/compare/v4.1.0...v4.1.1) (2019-12-10)



# [4.1.0](https://github.com/nfroidure/strict-qs/compare/v4.0.2...v4.1.0) (2019-02-02)


### Features

* **Types:** Add TypeScript types definitions ([e17f7cf](https://github.com/nfroidure/strict-qs/commit/e17f7cf))



## [4.0.2](https://github.com/nfroidure/strict-qs/compare/v4.0.1...v4.0.2) (2019-02-02)



## [4.0.1](https://github.com/nfroidure/strict-qs/compare/v4.0.0...v4.0.1) (2018-11-11)



# [4.0.0](https://github.com/nfroidure/strict-qs/compare/v3.0.3...v4.0.0) (2018-11-04)


### chore

* **Dependencies:** Update dependencies ([53e772a](https://github.com/nfroidure/strict-qs/commit/53e772a))


### BREAKING CHANGES

* **Dependencies:** Drops support for NodeJS < 8



## [3.0.3](https://github.com/nfroidure/strict-qs/compare/v3.0.2...v3.0.3) (2018-11-03)


### Bug Fixes

* **Tests:** Fix test for Node 10 ([a0482cd](https://github.com/nfroidure/strict-qs/commit/a0482cd))



<a name="3.0.2"></a>
## [3.0.2](https://github.com/nfroidure/strict-qs/compare/v3.0.1...v3.0.2) (2018-09-16)



<a name="3.0.1"></a>
## [3.0.1](https://github.com/nfroidure/strict-qs/compare/v3.0.0...v3.0.1) (2018-03-18)


### Bug Fixes

* **Metapak:** Remove old metapak postinstall script ([d7c83c1](https://github.com/nfroidure/strict-qs/commit/d7c83c1))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/nfroidure/strict-qs/compare/v2.0.1...v3.0.0) (2018-03-17)


### Code Refactoring

* **Dependencies:** Update `metapak` and `metapak-nfroidure` ([fa0e883](https://github.com/nfroidure/strict-qs/commit/fa0e883))


### BREAKING CHANGES

* **Dependencies:** Now using ES6 modules so using it with require will necessit some adaptations
(using `default` propr for instance.



<a name="2.0.1"></a>
## [2.0.1](https://github.com/nfroidure/strict-qs/compare/v2.0.0...v2.0.1) (2017-12-02)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/nfroidure/strict-qs/compare/v1.0.3...v2.0.0) (2017-05-29)


### Features

* **API:** Take the complete search in. ([c55ec03](https://github.com/nfroidure/strict-qs/commit/c55ec03))
* **input:** Check parameters patterns against input ([f4e7173](https://github.com/nfroidure/strict-qs/commit/f4e7173))
* **input:** Filter input according to `enum` properties of parameter definitions ([0ffae8e](https://github.com/nfroidure/strict-qs/commit/0ffae8e))


### BREAKING CHANGES

* API: Any code using this module will break. To fix it, just add the `?` sign to the
input your provide to the parser.



<a name="1.0.3"></a>
## [1.0.3](https://github.com/nfroidure/strict-qs/compare/v1.0.2...v1.0.3) (2017-03-04)




### v1.0.2 (2017/03/01 08:52 +00:00)
- [9550387](https://github.com/nfroidure/strict-qs/commit/95503878fca4ea5c32d21964b35196ee6c739ec4) 1.0.2 (@nfroidure)
- [0d8e5f6](https://github.com/nfroidure/strict-qs/commit/0d8e5f693194e34e66f9c8c364a5917e89c70d04) Decode URI components inside the lib (@nfroidure)
- [7267211](https://github.com/nfroidure/strict-qs/commit/72672110a269e65120c2ab07ccdfc90c3c817837) Add some debugging logs (@nfroidure)
- [6da000d](https://github.com/nfroidure/strict-qs/commit/6da000dc9069b1777a4ac7722bfddaa0cc72df42) Fix metapak update (@nfroidure)
- [9217709](https://github.com/nfroidure/strict-qs/commit/9217709008f7dfef7977ae3d5029c9d70fe5ecd3) Add metapak-nfroidure (@nfroidure)

### v1.0.1 (2017/01/18 09:38 +00:00)
- [f7726f5](https://github.com/nfroidure/strict-qs/commit/f7726f509be767cd00e0898b85de103c7944bc87) 1.0.1 (@nfroidure)
- [a7e78bb](https://github.com/nfroidure/strict-qs/commit/a7e78bbaf20d998fc24c51626dac860160538650) Add more feedback for debugging (@nfroidure)
- [def3b26](https://github.com/nfroidure/strict-qs/commit/def3b26909d262370b01fd140522f594cd85fd39) Fix badges (@nfroidure)

### v1.0.0 (2016/12/14 08:17 +00:00)
- [6fd8b9b](https://github.com/nfroidure/strict-qs/commit/6fd8b9ba3e4c20e93263fea753828a7c789c5cf7) 1.0.0 (@nfroidure)
- [4c186eb](https://github.com/nfroidure/strict-qs/commit/4c186eb33d67001c7173d3acd9ac4ef2d0d5d11c) Adding badges (@nfroidure)
- [244472d](https://github.com/nfroidure/strict-qs/commit/244472d71dfad26b23b0f30bc77f690734339cfa) Adds the ability to claim a collection as ordered (@nfroidure)
- [82fe4e1](https://github.com/nfroidure/strict-qs/commit/82fe4e1359806d12ffa18bc9b1f118a5285672a5) First commit (@nfroidure)
