import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity,Platform  } from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";
import RNPickerSelect from "react-native-picker-select";
import theme from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useTheme } from '../../context/ThemeContext';

const ChatHeader = ({ onPress, selectedValue }) => {
    const { isDarkTheme, toggleTheme } = useTheme(); // Utilisez le contexte du thème
    const mode = isDarkTheme ? 'dark' : 'light';
    const styles = getStyles(mode);
    const navigation = useNavigation();
    const [currentSelectedValue, setSelectedValue] = useState(selectedValue);
    const pickerSelectStyles = {
        inputIOS: {
            fontSize: hp('2%'),
            paddingVertical: hp('1%'),
            paddingHorizontal: wp('2%'),
            color: theme.colors[mode].black,
            backgroundColor: theme.colors[mode].white,
            paddingRight: wp('10%'), // Increase paddingRight to make space for the icon
        },
        inputAndroid: {
            fontSize: hp('2%'),
            paddingHorizontal: wp('2%'),
            paddingVertical: hp('1%'),
            color: theme.colors[mode].black,
            backgroundColor: theme.colors[mode].white,
            paddingRight: wp('10%'), // Increase paddingRight to make space for the icon
        },
        iconContainer: {
          top: Platform.select({ ios: hp('1.5%'), android: hp('2%') }), // Différencie iOS et Android
          right: wp('5%'),
        },
    };
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.iconButton} onPress={onPress}>
                <Icon name="bars" size={hp('3%')} color={theme.colors[mode].black} />
            </TouchableOpacity>

            <View style={styles.pickerContainer}>
                {/* <RNPickerSelect
                    onValueChange={(value) => setSelectedValue(value)}
                    value={currentSelectedValue}
                    items={[
                        { label: "Chat", value: "Chat" },
                        { label: "Rate", value: "Rate" },
                    ]}
                    style={pickerSelectStyles}
                    useNativeAndroidPickerStyle={false}
                    placeholder={{ label: "Select an option...", value: null }}
                    Icon={() => {
                        return <Icon name="chevron-down" size={hp('1.5%')} color="gray" />;
                    }}
                /> */}
            </View>

            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Home')}>
                <Icon name="home" size={hp('3%')} color={theme.colors[mode].black} />
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (mode) => StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: theme.colors[mode].white,
        paddingTop: Platform.select({ ios: hp('6%'), android: hp('2%') }),
        paddingBottom: hp('1%'),
        alignItems: "center",
        justifyContent: "space-between",
    },
    iconButton: {
        paddingHorizontal: wp('2%'),
    },
    pickerContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});



export default ChatHeader;
