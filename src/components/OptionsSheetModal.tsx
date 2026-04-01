import React from 'react';
import {
	Image,
	ImageSourcePropType,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

export type OptionSheetAction = {
	key: string;
	label: string;
	onPress: () => void;
	destructive?: boolean;
};

type OptionsSheetModalProps = {
	visible: boolean;
	onClose: () => void;
	title?: string;
	subtitle?: string;
	image?: ImageSourcePropType;
	options: OptionSheetAction[];
};

const OptionsSheetModal: React.FC<OptionsSheetModalProps> = ({
	visible,
	onClose,
	title,
	subtitle,
	image,
	options,
}) => {
	const handleOptionPress = (action: OptionSheetAction) => {
		onClose();
		action.onPress();
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<TouchableOpacity
				style={styles.overlay}
				activeOpacity={1}
				onPress={onClose}
			>
				<TouchableOpacity
					activeOpacity={1}
					style={styles.sheet}
					onPress={() => undefined}
				>
					<View style={styles.handle} />

					{!!title && (
						<View style={styles.header}>
							{image ? <Image source={image} style={styles.headerImage} /> : null}
							<View style={styles.headerTextWrap}>
								<Text style={styles.title} numberOfLines={1}>{title}</Text>
								{!!subtitle && (
									<Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
								)}
							</View>
						</View>
					)}

					<View style={styles.divider} />

					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.optionsWrap}
					>
						{options.map((action) => (
							<TouchableOpacity
								key={action.key}
								style={styles.optionRow}
								onPress={() => handleOptionPress(action)}
							>
								<Text style={[styles.optionText, action.destructive && styles.optionTextDanger]}>
									{action.label}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</TouchableOpacity>
			</TouchableOpacity>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.48)',
		justifyContent: 'flex-end',
	},
	sheet: {
		height: '78%',
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 34,
		borderTopRightRadius: 34,
		paddingHorizontal: 16,
		paddingTop: 10,
	},
	handle: {
		width: 54,
		height: 6,
		borderRadius: 3,
		backgroundColor: '#DDDDDD',
		alignSelf: 'center',
		marginBottom: 16,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingBottom: 16,
	},
	headerImage: {
		width: 64,
		height: 64,
		borderRadius: 16,
		marginRight: 12,
		backgroundColor: '#ECECEC',
	},
	headerTextWrap: {
		flex: 1,
	},
	title: {
		fontSize: 16,
		fontWeight: '700',
		color: '#171717',
		marginBottom: 2,
	},
	subtitle: {
		fontSize: 13,
		color: '#6A6A6A',
	},
	divider: {
		height: 1,
		backgroundColor: '#EFEFEF',
		marginBottom: 8,
	},
	optionsWrap: {
		paddingBottom: 18,
	},
	optionRow: {
		paddingVertical: 13,
	},
	optionText: {
		fontSize: 14,
		fontWeight: '500',
		color: '#1E1E1E',
	},
	optionTextDanger: {
		color: '#D92D20',
	},
});

export default OptionsSheetModal;
