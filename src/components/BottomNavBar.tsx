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
		<View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
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
		paddingHorizontal: 24,
		paddingTop: 14,
		marginTop: -40,
		borderTopLeftRadius: 34,
		borderTopRightRadius: 34,
		backgroundColor: '#FDFDFD',
		borderTopWidth: 1,
		borderTopColor: '#EEEEEE',
		overflow: 'hidden',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: -4,
		},
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 8,
	},
	tabButton: {
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: 68,
	},
	tabLabel: {
		fontSize: 11,
		fontWeight: '500',
		color: '#9A9A9A',
	},
	activeLabel: {
		color: colors.primary,
		fontWeight: '600',
	},
});

export default BottomNavBar;
