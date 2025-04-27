import { StyleSheet } from 'react-native';

export const colors = {
  gold: '#d6af36',
  dark: '#0a0a0a',
  lightText: '#eeeeee',
  backgroundOverlay: 'rgba(0,0,0,0.5)',
};

export const globalStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.dark,
    padding: 20,
  },

  title: {
    fontSize: 28,
    color: colors.gold,
    fontFamily: 'TarotTitles',
    textAlign: 'center',
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 20,
    color: colors.lightText,
    fontFamily: 'TarotBody',
    textAlign: 'center',
    marginBottom: 10,
  },

  text: {
    fontSize: 16,
    color: colors.lightText,
    fontFamily: 'TarotBody',
  },

  label: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'TarotBody',
    marginTop: 10,
  },

  value: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'TarotBody',
    fontWeight: '600',
  },

  brand: {
    fontSize: 36,
    fontFamily: 'TarotTitles',
    color: colors.gold,
    textAlign: 'center',
    marginBottom: 40,
  },

  button: {
    backgroundColor: colors.gold,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 20,
  },

  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'TarotBody',
  },
});
