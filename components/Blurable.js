import React from 'react'
import { StyleSheet, AppState, Text, View } from 'react-native'
import { BlurView } from "@react-native-community/blur"

export const Blurable = ({ children }) => {
    return (
        <BlurView blurType="light"
            style={styles.container}
            blurAmount={60}
        // reducedTransparencyFallbackColor="white"
        >
            {children}
        </BlurView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    containerBlur: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
});