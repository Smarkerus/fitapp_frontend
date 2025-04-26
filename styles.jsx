import { StyleSheet } from 'react-native';

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
  small: 12,
  medium: 16,
  large: 20,
  xLarge: 24,
};

const spacing = {
  small: 8,
  medium: 16,
  large: 24,
};

export const globalStyles = StyleSheet.create({
  background: {
    backgroundColor: '#ECF7ED',
    flex: 1,
  },
  container: {
    flex: 1,
    padding: spacing.medium,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.medium,
    borderRadius: 8,
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
    padding: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: sizes.medium,
    fontWeight: 'bold',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.medium,
    borderRadius: 8,
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
    padding: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  disabledButtonText: {
    color: colors.darkGray,
    fontSize: sizes.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    padding: spacing.medium,
    borderRadius: 8,
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
  listContainer: {
    flex: 1,
    padding: spacing.medium,
  },
  listItem: {
    backgroundColor: colors.white,
    padding: spacing.medium,
    borderRadius: 8,
    marginVertical: spacing.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  separator: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: spacing.medium,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.medium,
    marginVertical: spacing.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: sizes.large,
    fontWeight: 'bold',
    color: colors.text,
  },
});
