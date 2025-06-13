import { StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width } = Dimensions.get('window');

const scale = size => {
  const guidelineBaseWidth = 375;
  return (width / guidelineBaseWidth) * size;
};

const scaleFont = size => {
  return Math.round(PixelRatio.roundToNearestPixel(scale(size)));
};

const colors = {
  primary: '#4CAF50',
  secondary: '#8BC34A',
  background: '#F5F5F5',
  text: '#333333',
  accent: '#FFC107',
  error: 'red',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  darkGray: '#757575',
};

const sizes = {
  small: scaleFont(12),
  medium: scaleFont(16),
  large: scaleFont(20),
  xLarge: scaleFont(24),
};

const spacing = {
  small: scale(8),
  medium: scale(16),
  large: scale(24),
};

export const globalStyles = StyleSheet.create({
  background: {
    backgroundColor: '#ECF7ED',
    flex: 1,
  },
  container: {
    flex: 1,
    padding: wp('4%'),
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    padding: wp('4%'),
    borderRadius: scale(8),
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  buttonText: {
    color: colors.white,
    fontSize: sizes.medium,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    padding: wp('4%'),
    borderRadius: scale(8),
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: sizes.medium,
    fontWeight: 'bold',
  },
  outlineButton: {
    borderWidth: scale(2),
    borderColor: colors.primary,
    padding: wp('4%'),
    borderRadius: scale(8),
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: sizes.medium,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
    padding: wp('4%'),
    borderRadius: scale(8),
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  disabledButtonText: {
    color: colors.darkGray,
    fontSize: sizes.medium,
  },
  input: {
    borderWidth: scale(1),
    borderColor: colors.lightGray,
    padding: wp('4%'),
    borderRadius: scale(8),
    marginVertical: spacing.small,
    fontSize: sizes.medium,
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  text: {
    fontSize: sizes.medium,
    color: colors.text,
  },
  title: {
    fontSize: sizes.xLarge,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.medium,
  },
  subtitle: {
    fontSize: sizes.large,
    color: colors.darkGray,
    marginBottom: spacing.small,
    marginHorizontal: spacing.small,
  },
  welcome: {
    fontSize: sizes.xLarge,
    fontWeight: 'bold',
    color: colors.darkGray,
    textAlign: 'center',
    marginVertical: spacing.large,
  },
  errorText: {
    color: colors.error,
    fontSize: sizes.small,
    marginTop: spacing.small,
  },
  infoText: {
    fontSize: sizes.medium,
    color: colors.darkGray,
    marginBottom: spacing.medium,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    padding: wp('4%'),
  },
  listItem: {
    backgroundColor: colors.white,
    padding: wp('4%'),
    borderRadius: scale(8),
    marginVertical: spacing.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: scale(2),
  },
  listItemText: {
    fontSize: sizes.medium,
    color: colors.text,
  },
  listItemSubtitle: {
    fontSize: sizes.small,
    color: colors.darkGray,
    marginTop: spacing.small,
  },
  map: {
    width: '100%',
    height: hp('100%'),
  },
  separator: {
    height: scale(1),
    backgroundColor: colors.lightGray,
    marginVertical: spacing.medium,
  },
  scrollView: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: scale(2),
    padding: wp('4%'),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: scale(12),
    padding: wp('4%'),
    marginVertical: spacing.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.2,
    shadowRadius: scale(6),
    elevation: scale(4),
  },
  cardTitle: {
    fontSize: sizes.large,
    fontWeight: 'bold',
    color: colors.text,
  },
  colors,
  spacing,
  sizes,
});
