import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type BottomTab = 'Home' | 'Favorites' | 'Playlists' | 'Settings';

interface BottomNavBarProps {
	activeTab?: BottomTab;
	onTabPress?: (tab: BottomTab) => void;
}

const tabs: BottomTab[] = ['Home', 'Favorites', 'Playlists', 'Settings'];

const BottomNavBar: React.FC<BottomNavBarProps> = ({
	activeTab = 'Home',
	onTabPress,
}) => {
	const insets = useSafeAreaInsets();

	const renderIcon = (tab: BottomTab, isActive: boolean) => {
		const iconColor = isActive ? colors.primary : '#ACACAC';

		switch (tab) {
			case 'Home':
				return <Ionicons name={isActive ? 'home' : 'home-outline'} size={30} color={iconColor} />;
			case 'Favorites':
				return <Ionicons name={isActive ? 'heart' : 'heart-outline'} size={30} color={iconColor} />;
			case 'Playlists':
				return <Ionicons name={isActive ? 'list' : 'list-outline'} size={28} color={iconColor} />;
			case 'Settings':
				return <Ionicons name={isActive ? 'settings' : 'settings-outline'} size={30} color={iconColor} />;
			default:
				return null;
		}
	};

	return (
		<View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
			{tabs.map((tab) => {
				const isActive = activeTab === tab;

				return (
					<TouchableOpacity
						key={tab}
						style={styles.tabButton}
						onPress={() => onTabPress?.(tab)}
						activeOpacity={0.85}
					>
						{renderIcon(tab, isActive)}
						<Text style={[styles.tabLabel, isActive && styles.activeLabel]}>{tab}</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 18,
		paddingTop: 10,
		marginTop: -20,
		backgroundColor: '#FFFFFF',
		borderTopWidth: 1,
		borderTopColor: '#ECECEC',
	},
	tabButton: {
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: 68,
	},
	tabLabel: {
		marginTop: 2,
		fontSize: 10,
		fontWeight: '500',
		color: '#9A9A9A',
	},
	activeLabel: {
		color: colors.primary,
		fontWeight: '600',
	},
});

export default BottomNavBar;
