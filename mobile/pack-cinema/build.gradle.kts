plugins {
    id("com.android.asset-pack")
}

assetPack {
    packName.set("cinema")
    dynamicDelivery {
        deliveryType.set("install-time")
    }
}
