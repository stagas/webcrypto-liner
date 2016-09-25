namespace webcrypto.liner {

    declare type IE = any;

    export class SubtleCrypto extends webcrypto.SubtleCrypto {

        generateKey(algorithm: AlgorithmIdentifier, extractable: boolean, keyUsages: string[]): PromiseLike<CryptoKey | CryptoKeyPair> {
            const args = arguments;
            let _alg: Algorithm;
            return super.generateKey.apply(this, args)
                .then((d: Uint8Array) => {
                    _alg = PrepareAlgorithm(algorithm);

                    try {
                        return nativeSubtle.generateKey.apply(nativeSubtle, args)
                            .catch((e: Error) => {
                                console.warn(`WebCrypto: native generateKey for ${_alg.name} doesn't work.`, e.message || "");
                            });
                    }
                    catch (e) {
                        console.warn(`WebCrypto: native generateKey for ${_alg.name} doesn't work.`, e.message || "");
                    }
                })
                .then((keys: CryptoKey | CryptoKeyPair) => {

                    if (keys) {
                        if ("keyUsage" in keys || ((keys as IE).privateKey && "keyUsage" in keys)) {
                            let _keys: IE = keys;
                            if (!_keys.privateKey)
                                _keys.usages = keyUsages;
                        }
                        return new Promise(resolve => resolve(keys));
                    }
                    let Class: typeof BaseCrypto;
                    switch (_alg.name.toLowerCase()) {
                        case AlgorithmNames.AesCBC.toLowerCase():
                        case AlgorithmNames.AesGCM.toLowerCase():
                            Class = aes.AesCrypto;
                            break;
                        case AlgorithmNames.EcDSA.toLowerCase():
                        case AlgorithmNames.EcDH.toLowerCase():
                            Class = ec.EcCrypto;
                            break;
                        default:
                            throw new LinerError(LinerError.NOT_SUPPORTED, "generateKey");
                    }
                    return Class.generateKey(_alg, extractable, keyUsages);
                });
        }

        digest(algorithm: AlgorithmIdentifier, data: BufferSource): PromiseLike<ArrayBuffer> {
            const args = arguments;
            let _alg: Algorithm;
            let _data: Uint8Array;
            return super.digest.apply(this, args)
                .then((d: Uint8Array) => {
                    _alg = PrepareAlgorithm(algorithm);
                    _data = PrepareData(data, "data");

                    try {
                        return nativeSubtle.digest.apply(nativeSubtle, args)
                            .catch((e: Error) => {
                                console.warn(`WebCrypto: native digest for ${_alg.name} doesn't work.`, e.message || "");
                            });
                    }
                    catch (e) {
                        console.warn(`WebCrypto: native digest for ${_alg.name} doesn't work.`, e.message || "");
                    }
                })
                .then((digest: ArrayBuffer) => {
                    if (digest) return new Promise(resolve => resolve(digest));
                    return sha.ShaCrypto.digest(_alg, _data);
                });
        }

        sign(algorithm: string | RsaPssParams | EcdsaParams | AesCmacParams, key: CryptoKey, data: BufferSource): PromiseLike<ArrayBuffer> {
            const args = arguments;
            let _alg: Algorithm;
            let _data: Uint8Array;
            return super.sign.apply(this, args)
                .then((d: Uint8Array) => {
                    _alg = PrepareAlgorithm(algorithm as string);
                    _data = PrepareData(data, "data");

                    try {
                        return nativeSubtle.sign.apply(nativeSubtle, args)
                            .catch((e: Error) => {
                                console.warn(`WebCrypto: native sign for ${_alg.name} doesn't work.`, e.message || "");
                            });
                    }
                    catch (e) {
                        console.warn(`WebCrypto: native sign for ${_alg.name} doesn't work.`, e.message || "");
                    }
                })
                .then((signature: ArrayBuffer) => {
                    if (signature) return new Promise(resolve => resolve(signature));
                    let Class: typeof BaseCrypto;
                    switch (_alg.name.toLowerCase()) {
                        case AlgorithmNames.EcDSA.toLowerCase():
                            Class = ec.EcCrypto;
                            break;
                        default:
                            throw new LinerError(LinerError.NOT_SUPPORTED, "sign");
                    }
                    return Class.sign(_alg, key, _data);
                });
        }

        deriveBits(algorithm: AlgorithmIdentifier, baseKey: CryptoKey, length: number): PromiseLike<ArrayBuffer> {
            const args = arguments;
            let _alg: Algorithm;
            return super.deriveBits.apply(this, args)
                .then((bits: ArrayBuffer) => {
                    _alg = PrepareAlgorithm(algorithm);

                    try {
                        return nativeSubtle.deriveBits.apply(nativeSubtle, args)
                            .catch((e: Error) => {
                                console.warn(`WebCrypto: native deriveBits for ${_alg.name} doesn't work.`, e.message || "");
                            });
                    }
                    catch (e) {
                        // Edge throws error. Don't know Why.
                        console.warn(`WebCrypto: native deriveBits for ${_alg.name} doesn't work.`, e.message || "");
                    }

                })
                .then((bits: ArrayBuffer) => {
                    if (bits) return new Promise(resolve => resolve(bits));
                    let Class: typeof BaseCrypto;
                    switch (_alg.name.toLowerCase()) {
                        case AlgorithmNames.EcDH.toLowerCase():
                            Class = ec.EcCrypto;
                            break;
                        default:
                            throw new LinerError(LinerError.NOT_SUPPORTED, "deriveBits");
                    }
                    return Class.deriveBits(_alg, baseKey, length);
                });
        }

        deriveKey(algorithm: AlgorithmIdentifier, baseKey: CryptoKey, derivedKeyType: AlgorithmIdentifier, extractable: boolean, keyUsages: string[]): PromiseLike<CryptoKey> {
            const args = arguments;
            let _alg: Algorithm;
            let _algDerivedKey: Algorithm;
            return super.deriveKey.apply(this, args)
                .then((bits: ArrayBuffer) => {
                    _alg = PrepareAlgorithm(algorithm);
                    _algDerivedKey = PrepareAlgorithm(derivedKeyType);

                    try {
                        return nativeSubtle.deriveKey.apply(nativeSubtle, args)
                            .catch((e: Error) => {
                                console.warn(`WebCrypto: native deriveKey for ${_alg.name} doesn't work.`, e.message || "");
                            });
                    } catch (e) {
                        // Edge doesn't go to catch of Promise
                        console.warn(`WebCrypto: native deriveKey for ${_alg.name} doesn't work.`, e.message || "");
                    }
                })
                .then((key: CryptoKey) => {
                    if (key) return new Promise(resolve => resolve(key));
                    let Class: typeof BaseCrypto;
                    switch (_alg.name.toLowerCase()) {
                        case AlgorithmNames.EcDH.toLowerCase():
                            Class = ec.EcCrypto;
                            break;
                        default:
                            throw new LinerError(LinerError.NOT_SUPPORTED, "deriveBits");
                    }
                    return Class.deriveKey(_alg, baseKey, _algDerivedKey, extractable, keyUsages);
                });
        }

        encrypt(algorithm: AlgorithmIdentifier, key: CryptoKey, data: BufferSource): PromiseLike<ArrayBuffer> {
            const args = arguments;
            let _alg: Algorithm;
            let _data: Uint8Array;
            return super.encrypt.apply(this, args)
                .then((bits: ArrayBuffer) => {
                    _alg = PrepareAlgorithm(algorithm);
                    _data = PrepareData(data, "data");

                    try {
                        return nativeSubtle.encrypt.apply(nativeSubtle, args)
                            .catch((e: Error) => {
                                console.warn(`WebCrypto: native 'encrypt' for ${_alg.name} doesn't work.`, e.message || "");
                            });
                    }
                    catch (e) {
                        console.warn(`WebCrypto: native 'encrypt' for ${_alg.name} doesn't work.`, e.message || "");
                    }
                })
                .then((msg: ArrayBuffer) => {
                    if (msg) return new Promise(resolve => resolve(msg));
                    let Class: typeof BaseCrypto;
                    switch (_alg.name.toLowerCase()) {
                        case AlgorithmNames.AesCBC.toLowerCase():
                        case AlgorithmNames.AesGCM.toLowerCase():
                            Class = aes.AesCrypto;
                            break;
                        default:
                            throw new LinerError(LinerError.NOT_SUPPORTED, "encrypt");
                    }
                    return Class.encrypt(_alg, key, _data);
                });
        }
        decrypt(algorithm: AlgorithmIdentifier, key: CryptoKey, data: BufferSource): PromiseLike<ArrayBuffer> {
            const args = arguments;
            let _alg: Algorithm;
            let _data: Uint8Array;
            return super.decrypt.apply(this, args)
                .then((bits: ArrayBuffer) => {
                    _alg = PrepareAlgorithm(algorithm);
                    _data = PrepareData(data, "data");

                    try {
                        return nativeSubtle.decrypt.apply(nativeSubtle, args)
                            .catch((e: Error) => {
                                console.warn(`WebCrypto: native 'decrypt' for ${_alg.name} doesn't work.`, e.message || "");
                            });
                    }
                    catch (e) {
                        console.warn(`WebCrypto: native 'decrypt' for ${_alg.name} doesn't work.`, e.message || "");
                    }
                })
                .then((msg: ArrayBuffer) => {
                    if (msg) return new Promise(resolve => resolve(msg));
                    let Class: typeof BaseCrypto;
                    switch (_alg.name.toLowerCase()) {
                        case AlgorithmNames.AesCBC.toLowerCase():
                        case AlgorithmNames.AesGCM.toLowerCase():
                            Class = aes.AesCrypto;
                            break;
                        default:
                            throw new LinerError(LinerError.NOT_SUPPORTED, "encrypt");
                    }
                    return Class.decrypt(_alg, key, _data);
                });
        }

        wrapKey(format: string, key: CryptoKey, wrappingKey: CryptoKey, wrapAlgorithm: AlgorithmIdentifier): PromiseLike<ArrayBuffer> {
            const args = arguments;
            let _alg: Algorithm;
            return super.wrapKey.apply(this, args)
                .then((bits: ArrayBuffer) => {
                    _alg = PrepareAlgorithm(wrapAlgorithm);

                    try {
                        return nativeSubtle.wrapKey.apply(nativeSubtle, args)
                            .catch((e: Error) => {
                                console.warn(`WebCrypto: native 'wrapKey' for ${_alg.name} doesn't work.`, e.message || "");
                            });
                    }
                    catch (e) {
                        console.warn(`WebCrypto: native 'wrapKey' for ${_alg.name} doesn't work.`, e.message || "");
                    }
                })
                .then((msg: ArrayBuffer) => {
                    if (msg) return new Promise(resolve => resolve(msg));
                    let Class: typeof BaseCrypto;
                    switch (_alg.name.toLowerCase()) {
                        case AlgorithmNames.AesCBC.toLowerCase():
                        case AlgorithmNames.AesGCM.toLowerCase():
                            Class = aes.AesCrypto;
                            break;
                        default:
                            throw new LinerError(LinerError.NOT_SUPPORTED, "wrapKey");
                    }
                    return Class.wrapKey(format, key, wrappingKey, _alg);
                });
        }

        unwrapKey(format: string, wrappedKey: BufferSource, unwrappingKey: CryptoKey, unwrapAlgorithm: AlgorithmIdentifier, unwrappedKeyAlgorithm: AlgorithmIdentifier, extractable: boolean, keyUsages: string[]): PromiseLike<CryptoKey> {
            const args = arguments;
            let _alg: Algorithm;
            let _algKey: Algorithm;
            let _data: Uint8Array;
            return super.unwrapKey.apply(this, args)
                .then((bits: ArrayBuffer) => {
                    _alg = PrepareAlgorithm(unwrapAlgorithm);
                    _algKey = PrepareAlgorithm(unwrappedKeyAlgorithm);
                    _data = PrepareData(wrappedKey, "wrappedKey");

                    try {
                        return nativeSubtle.unwrapKey.apply(nativeSubtle, args)
                            .catch((e: Error) => {
                                console.warn(`WebCrypto: native 'unwrapKey' for ${_alg.name} doesn't work.`, e.message || "");
                            });
                    }
                    catch (e) {
                        console.warn(`WebCrypto: native 'unwrapKey' for ${_alg.name} doesn't work.`, e.message || "");
                    }
                })
                .then((msg: ArrayBuffer) => {
                    if (msg) return new Promise(resolve => resolve(msg));
                    let Class: typeof BaseCrypto;
                    switch (_alg.name.toLowerCase()) {
                        case AlgorithmNames.AesCBC.toLowerCase():
                        case AlgorithmNames.AesGCM.toLowerCase():
                            Class = aes.AesCrypto;
                            break;
                        default:
                            throw new LinerError(LinerError.NOT_SUPPORTED, "unwrapKey");
                    }
                    return Class.unwrapKey(format, _data, unwrappingKey, _alg, _algKey, extractable, keyUsages);
                });
        }

        exportKey(format: string, key: CryptoKey): PromiseLike<JsonWebKey | ArrayBuffer> {
            const args = arguments;
            return super.exportKey.apply(this, args)
                .then(() => {

                    try {
                        return nativeSubtle.exportKey.apply(nativeSubtle, args)
                            .catch((e: Error) => {
                                console.warn(`WebCrypto: native 'exportKey' for ${key.algorithm.name} doesn't work.`, e.message || "");
                            });
                    }
                    catch (e) {
                        console.warn(`WebCrypto: native 'exportKey' for ${key.algorithm.name} doesn't work.`, e.message || "");
                    }
                })
                .then((msg: ArrayBuffer) => {
                    if (msg) return new Promise(resolve => resolve(msg));
                    let Class: typeof BaseCrypto;
                    switch (key.algorithm.name!.toLowerCase()) {
                        case AlgorithmNames.AesCBC.toLowerCase():
                        case AlgorithmNames.AesGCM.toLowerCase():
                            Class = aes.AesCrypto;
                            break;
                        case AlgorithmNames.EcDH.toLowerCase():
                        case AlgorithmNames.EcDSA.toLowerCase():
                            Class = ec.EcCrypto;
                            break;
                        default:
                            throw new LinerError(LinerError.NOT_SUPPORTED, "exportKey");
                    }
                    return Class.exportKey(format, key);
                });
        }

        importKey(format: string, keyData: JsonWebKey | BufferSource, algorithm: AlgorithmIdentifier, extractable: boolean, keyUsages: string[]): PromiseLike<CryptoKey> {
            const args = arguments;
            let _alg: Algorithm;
            let _data: any;
            return super.importKey.apply(this, args)
                .then((bits: ArrayBuffer) => {
                    _alg = PrepareAlgorithm(algorithm);
                    _data = keyData;
                    if (ArrayBuffer.isView(keyData)) {
                        _data = PrepareData(keyData, "keyData");
                    }

                    try {
                        return nativeSubtle.importKey.apply(nativeSubtle, args)
                            .catch((e: Error) => {
                                console.warn(`WebCrypto: native 'importKey' for ${_alg.name} doesn't work.`, e.message || "");
                            });
                    }
                    catch (e) {
                        console.warn(`WebCrypto: native 'importKey' for ${_alg.name} doesn't work.`, e.message || "");
                    }
                })
                .then((msg: ArrayBuffer) => {
                    if (msg) return new Promise(resolve => resolve(msg));
                    let Class: typeof BaseCrypto;
                    switch (_alg.name.toLowerCase()) {
                        case AlgorithmNames.AesCBC.toLowerCase():
                        case AlgorithmNames.AesGCM.toLowerCase():
                            Class = aes.AesCrypto;
                            break;
                        case AlgorithmNames.EcDH.toLowerCase():
                        case AlgorithmNames.EcDSA.toLowerCase():
                            Class = ec.EcCrypto;
                            break;
                        default:
                            throw new LinerError(LinerError.NOT_SUPPORTED, "importKey");
                    }
                    return Class.importKey(format, _data, _alg, extractable, keyUsages);
                });
        }
    }
}