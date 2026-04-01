import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const FavouritesScreen = () => {
    return (
        <SafeAreaView style={styles.placeholderScreen}>
            <Text style={styles.placeholderTitle}>Favourites</Text>
            <Text style={styles.placeholderSubtitle}>This section will be available soon.</Text>
        </SafeAreaView>
    )
}

export default FavouritesScreen

const styles = StyleSheet.create({

    placeholderScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    placeholderTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    placeholderSubtitle: {
        fontSize: 14,
        color: '#707070',
    },
})