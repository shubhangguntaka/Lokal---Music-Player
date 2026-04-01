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
import { useThemeColors } from '../theme/colors';

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
	const theme = useThemeColors();

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
				style={[styles.overlay, { backgroundColor: theme.overlay }]}
				activeOpacity={1}
				onPress={onClose}
			>
				<TouchableOpacity
					activeOpacity={1}
					style={[styles.sheet, { backgroundColor: theme.surface }]}
					onPress={() => undefined}
				>
					<View style={[styles.handle, { backgroundColor: theme.handle }]} />

					{!!title && (
						<View style={styles.header}>
							{image ? <Image source={image} style={styles.headerImage} /> : null}
							<View style={styles.headerTextWrap}>
								<Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{title}</Text>
								{!!subtitle && (
									<Text style={[styles.subtitle, { color: theme.subText }]} numberOfLines={1}>{subtitle}</Text>
								)}
							</View>
						</View>
					)}

					<View style={[styles.divider, { backgroundColor: theme.border }]} />

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
								<Text
									style={[
										styles.optionText,
										{ color: theme.text },
										action.destructive && styles.optionTextDanger,
										action.destructive && { color: theme.danger },
									]}
								>
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
		justifyContent: 'flex-end',
	},
	sheet: {
		height: '78%',
		borderTopLeftRadius: 34,
		borderTopRightRadius: 34,
		paddingHorizontal: 16,
		paddingTop: 10,
	},
	handle: {
		width: 54,
		height: 6,
		borderRadius: 3,
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
		backgroundColor: '#DADADA',
	},
	headerTextWrap: {
		flex: 1,
	},
	title: {
		fontSize: 16,
		fontWeight: '700',
		marginBottom: 2,
	},
	subtitle: {
		fontSize: 13,
	},
	divider: {
		height: 1,
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
	},
	optionTextDanger: {
		fontWeight: '600',
	},
});

export default OptionsSheetModal;
