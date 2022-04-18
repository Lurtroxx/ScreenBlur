import React, { PureComponent } from "react";

import {
    Animated,
    Image,
    Keyboard,
    StyleSheet,
    View,
    Platform,
    AppState,
} from "react-native";

import { Navigation } from "react-native-navigation";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import Tts from "react-native-tts";

import KochavaTracker from "react-native-kochava-tracker";

import { SafeAreaView } from "../common/SafeAreaView";

import { Button } from "../common/Button";

import { Header } from "../common/Header";

import { StatusBanner } from "../common/StatusBanner";

import { Text } from "../common/Text";

import { TextInput } from "../common/TextInput";

import { TransitionWrapper } from "../common/TransitionWrapper";

import {
    HomeTabs,
    Pop,
    ShowOverlay,
    Push,
    InitialTasksStack,
} from "../../config/navigation/navigation";

import { strings } from "../../strings";

import { util } from "../../utils";

import { theme } from "../../config/styles";

import { constants } from "../../utils/appConstants";

import { IconButton } from "../common/IconButton";

import DeviceInfo from "react-native-device-info";

import { isSmallDeviceHeight } from "../../utils/AppUtils";

import analytics from "@react-native-firebase/analytics";

import { BlurView } from "@react-native-community/blur";

// console.disableYellowBox = true

const { OS, Version } = Platform;

// const testIDs = require('../../constants/testIDS')

const cancelButtonHitSlop = {
    top: 10,

    bottom: 10,

    left: 10,

    right: 10,
};

const SCROLL_HEIGHT = isSmallDeviceHeight(680) ? 100 : 80;

export class SignIn extends PureComponent {
    constructor(props) {
        super(props);

        this.appState = React.createRef(AppState.currentState);

        const { userProfile } = props;

        this.scrollViewRef = React.createRef();

        this.timerRef = React.createRef();

        this.state = {
            disableCancel: false,

            email: (userProfile && userProfile.email) || "",

            emailIsValid: Boolean(userProfile && userProfile.email),

            opacity: new Animated.Value(1),

            password: "",

            passwordisValid: false,

            showButtonLoader: false,

            showLoginError: false,

            signInMessageOpacity: new Animated.Value(1),

            keyboardHeight: "15%",

            lastFieldInFocus: false,

            flexGrow: 1,

            appStateVisible: AppState.currentState,
        };
    }

    _formatSignInMessage = () => {
        const splitMessage1 = strings.signInMessage1.split(" ");

        const splitMessage2 = strings.signInMessage2.split(" ");

        return { splitMessage1, splitMessage2 };
    };

    _goBack = () => {
        this.props.loginCancelled();

        // If the user is in the middle of guest flow

        if (this.state.disableCancel) {
            this.props.resetToGuest();

            Navigation.popToRoot(this.props.intent.destination);
        } else {
            Pop(this.props.componentId);
        }
    };

    _onBannerClose = () => this.setState({ showLoginError: false });

    _onChangeText = (field, text) => this.setState({ [field]: text });

    _trackUserSignIn = () => {
        try {
            KochavaTracker.sendEventString("User signed in successfully");

            analytics()
                .logEvent("user_signed_in_successfully")

                .then((r) => {
                    if (__DEV__) {
                        console.log("FIREBASE --->", r);
                    }
                });
        } catch (e) {
            if (__DEV__) {
                console.log("FIREBASE --->", e);
            }
        }
    };

    _onSignIn = () => {
        const { login } = this.props;

        const { email, password } = this.state;

        // const hashedValue = util.hash(password)

        if (this.state.emailIsValid && this.state.passwordisValid)
            login({ userName: email, password });

        Keyboard.dismiss();
    };

    _resetPassword = () => {
        ShowOverlay("ResetPassword", { email: this.state.email });

        if (this.props.accessibilityStatus) {
            Tts.speak(strings.resetPasswordScreen);
        }
    };

    _showLoader = () => {
        if (Object.keys(this.props.intent).length !== 0) {
            this.setState({ disableCancel: true });
        }

        this.setState({ showButtonLoader: true });
    };

    _showLoginError = (showLoginError) => {
        this.setState({
            showLoginError,
            showButtonLoader: false,
            disableCancel: false,
        });

        // Animated.timing(this.state.signInMessageOpacity, {

        //     toValue: showLoginError ? 0 : 1,

        //     duration: theme.fadeDuration,

        //     useNativeDriver: true,

        // }).start()
    };

    _transitionToHome = () => {
        if (Object.keys(this.props.intent).length !== 0) {
            /* The decision to PUSH, MERGE or SHOWOVERLAY is offloaded to appState/sagas check
      
                  handleIntent in  appState/sagas */

            /* Send {intentSuccess: true} so the app wont just clear the nav stack */

            this.props.handleIntent({ intentSuccess: true });
        } else {
            /** show7NowPINSScreen will be set to false, when user click OK or 'X' on the Seven Now PINS Screen. So, If not set to false, we show the screen */

            if (
                this.props.show7NowPINSScreenConfig === true &&
                this.props.show7NowPINSScreen !== true
            ) {
                this.setState({ disableCancel: true }, () =>
                    Animated.timing(this.state.opacity, {
                        toValue: 0,

                        duration: theme.fadeDuration,
                    }).start(
                        InitialTasksStack({
                            nextStack: "HomeTabs",
                        })
                    )
                );
            } else
                this.setState({ disableCancel: true }, () =>
                    Animated.timing(this.state.opacity, {
                        toValue: 0,

                        duration: theme.fadeDuration,
                    }).start(HomeTabs)
                );
        }
    };

    _validateEmail = () => {
        const { email } = this.state;

        const emailIsValid = util.validateEmail(email);

        this.setState({ emailIsValid });

        return emailIsValid;
    };

    _validatePassword = () => {
        const { password } = this.state;

        const passwordisValid = password && password.length > 0;

        this.setState({ passwordisValid });

        return passwordisValid;
    };

    componentDidUpdate(prevProps) {
        const { loggingIn, loginError, userProfile } = this.props;

        if (!prevProps.loggingIn && loggingIn) {
            this._showLoader();
        }

        if (prevProps.loggingIn && !loggingIn && loginError) {
            this._showLoginError(true);
        }

        if (prevProps.loggingIn && !loggingIn && userProfile && !loginError) {
            this._trackUserSignIn();

            this._transitionToHome();
        }

        if (Platform.OS === "android" && this.state.lastFieldInFocus) {
            this.scrollViewRef?.scrollToEnd({ animated: true });
        }

        if (Platform.OS === "ios" && this.state.lastFieldInFocus) {
            this.scrollViewRef?.scrollToPosition(0, SCROLL_HEIGHT, true);
        }

        Keyboard.addListener("keyboardDidHide", this.onKeyboardWillHide);

        Keyboard.addListener("keyboardWillShow", this.onKeyBoardWillShow);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appStateVisible !== nextAppState) {
            this.setState({ appStateVisible: nextAppState });
        }
        console.log(this.state.appStateVisible);
    };

    componentDidMount() {
        AppState.addEventListener("change", () => this._handleAppStateChange());
    }

    componentWillUnmount() {
        AppState.removeEventListener("change", () => this._handleAppStateChange());
        clearTimeout(this.timerRef);
        Keyboard.removeListener("keyboardWillShow", this.onKeyBoardWillShow);
        Keyboard.removeListener("keyboardWillHide", this.onKeyboardWillHide);
    }

    onKeyBoardWillShow = (e) => {
        if (this.state.lastFieldInFocus) {
            this.setState({ flexGrow: 1, keyboardHeight: e.endCoordinates.height });

            if (Platform.OS === "android") {
                this.scrollViewRef?.scrollToEnd({ animated: true });
            } else {
                this.timerRef = setTimeout(() => {
                    this.scrollViewRef?.scrollToPosition(0, SCROLL_HEIGHT, true);
                }, 600);
            }
        }
    };

    onKeyboardWillHide = (e) => {
        this.setState({ flexGrow: 1, keyboardHeight: "15%" });
    };

    render() {
        const { loginError, usernameLength, passwordLength } = this.props;

        const {
            disableCancel,

            email,

            emailIsValid,

            opacity,

            password,

            passwordisValid,

            showButtonLoader,

            showLoginError,

            showPassword,

            signInMessageOpacity,
        } = this.state;

        const { splitMessage1, splitMessage2 } = this._formatSignInMessage();

        return (
            <Animated.View style={[styles.container, { opacity }]}>
                <SafeAreaView style={styles.safeAreaView}>
                    <KeyboardAwareScrollView
                        alwaysBounceVertical={false}
                        contentContainerStyle={styles.keyboardAwareView}
                        keyboardShouldPersistTaps="always"
                        onKeyboardWillHide={(e) => this.onKeyboardWillHide(e)}
                        onKeyboardWillShow={(e) => this.onKeyBoardWillShow(e)}
                        enableOnAndroid={true}
                        ref={(ref) => (this.scrollViewRef = ref)}
                        keyboardDismissMode="on-drag"
                        enableAutomaticScroll
                    >
                        <View style={{ flexGrow: this.state.flexGrow }}>
                            <Header text={strings.signIn} onClosePress={this._goBack} />

                            {showLoginError ? (
                                <StatusBanner
                                    isError
                                    message={loginError}
                                    onClose={() => this._showLoginError(false)}
                                    visible={showLoginError}
                                />
                            ) : null}

                            {/* <TransitionWrapper transition="slideAndFadeIn" delay={200}> */}

                            <Animated.View
                                accessible
                                accessibleLabel={strings.signInText}
                                style={[
                                    styles.signInMessageContainer,

                                    { opacity: signInMessageOpacity },
                                ]}
                            >
                                {splitMessage1.map((word, index) => (
                                    // eslint-disable-next-line

                                    <Text key={word + index} style={styles.signInMessageWord}>
                                        {`${word} `}
                                    </Text>
                                ))}

                                <Image
                                    accessibilityRole="image"
                                    accessibilityLabel={strings.rewardImage}
                                    source={require("../../assets/images/7REWARDS.png")}
                                    style={styles.image}
                                />

                                {splitMessage2.map((word, index) => (
                                    // eslint-disable-next-line

                                    <Text key={word + index} style={styles.signInMessageWord}>
                                        {`${word} `}
                                    </Text>
                                ))}
                            </Animated.View>

                            {/* </TransitionWrapper> */}

                            <TransitionWrapper transition="slideAndFadeIn" delay={200}>
                                <TextInput
                                    // testID={testIDs.SIGNIN_EMAIL_TXTINPUT}

                                    // accessible={true}

                                    // accessibilityLabel={"form"}

                                    accessibilityHint={"Enter Email"}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    error={strings.emailError}
                                    defaultValue={email}
                                    keyboardType="email-address"
                                    label={strings.email}
                                    onChangeText={(text) => this._onChangeText("email", text)}
                                    validation={this._validateEmail}
                                    value={email}
                                    maxLength={usernameLength}
                                    clearButtonMode="while-editing"
                                    onClearButtonPressAndroid={() =>
                                        this._onChangeText("email", "")
                                    }
                                    onFocus={() =>
                                        this.setState({
                                            lastFieldInFocus: false,

                                            keyboardHeight: Platform.select({
                                                ios: "15%",

                                                android: 250,
                                            }),
                                        })
                                    }
                                    onBlur={() => this.setState({ keyboardHeight: "15%" })}
                                />
                            </TransitionWrapper>

                            <TransitionWrapper transition="slideAndFadeIn" delay={250}>
                                <TextInput
                                    // testID={testIDs.SIGNIN_PASSWORD_TXTINPUT}

                                    accessibilityHint={"Enter Password"}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    label={strings.password}
                                    error={strings.passwordError}
                                    onChangeText={(text) => this._onChangeText("password", text)}
                                    onSubmitEditing={this._onSignIn}
                                    showPasswordButton
                                    secureTextEntry={!showPassword}
                                    validation={this._validatePassword}
                                    validateOnChange
                                    value={password}
                                    maxLength={passwordLength}
                                    onBlur={() =>
                                        this.setState({ lastFieldInFocus: false, flexGrow: 1 })
                                    }
                                    onFocus={() => {
                                        if (Platform.OS === "android")
                                            this.scrollViewRef?.scrollToEnd({ animated: true });

                                        this.setState({ lastFieldInFocus: true, flexGrow: 0 });
                                    }}
                                />

                                <View style={styles.forgotPassword}>
                                    <Button
                                        // testID={testIDs.SIGNIN_FORGOT_PASSWORD_BTN}

                                        accessible
                                        accessibilityLabel={strings.forgotPassword}
                                        accessibilityRole="button"
                                        onPress={this._resetPassword}
                                        text={`${strings.forgotPassword}`}
                                        textButton
                                        textStyle={styles.forgotPasswordText}
                                        style={styles.sendResetEmail}
                                    />
                                </View>
                            </TransitionWrapper>
                        </View>

                        <TransitionWrapper transition="slideAndFadeIn" delay={300}>
                            <View
                                style={[
                                    styles.buttonContainer,

                                    {
                                        justifyContent: this.state.lastFieldInFocus
                                            ? "flex-start"
                                            : "flex-end",

                                        height: this.state.keyboardHeight,
                                    },
                                ]}
                            >
                                <Button
                                    // testID={testIDs.SIGNIN_BTN}

                                    accessible
                                    accessibilityLabel={strings.signInButton}
                                    accessibilityRole="button"
                                    solid
                                    text={strings.signIn}
                                    upperCase
                                    onPress={this._onSignIn}
                                    loading={showButtonLoader && !showLoginError}
                                    disabled={!emailIsValid || !passwordisValid}
                                />

                                <Button
                                    // testID={testIDs.CANCEL_BTN}

                                    accessible
                                    accessibilityLabel={strings.cancelButton}
                                    accessibilityRole="button"
                                    disabled={disableCancel}
                                    text={strings.cancel}
                                    textStyle={styles.cancelButtonText}
                                    upperCase
                                    onPress={this._goBack}
                                    isCancelButton
                                    style={styles.cancelButton}
                                    hitSlop={cancelButtonHitSlop}
                                />
                            </View>
                        </TransitionWrapper>
                    </KeyboardAwareScrollView>
                </SafeAreaView>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexGrow: 1,

        alignSelf: "stretch",

        marginTop: 30,
    },

    cancelButton: {
        alignSelf: "center",

        backgroundColor: "transparent",

        height: "auto",

        margin: theme.baseUnit,

        paddingHorizontal: theme.baseUnit,

        borderRadius: theme.baseUnit,
    },

    close: {
        width: 36,

        height: 36,

        borderRadius: 18,

        color: theme.palette.green,
    },

    container: {
        flexGrow: 1,

        justifyContent: "space-between",

        backgroundColor: theme.palette.white,
    },

    safeAreaView: {
        flexGrow: 1,

        justifyContent: "space-between",

        backgroundColor: theme.palette.white,

        marginTop:
            Platform.OS === "ios"
                ? parseInt(Platform.Version, 10) >= 11
                    ? 0
                    : 18
                : 0,
    },

    errorText: {
        alignSelf: "center",

        color: theme.palette.red,

        marginVertical: theme.marginVertical,

        textAlign: "center",
    },

    flexGrow: {
        flexGrow: 1,
    },

    forgotPassword: {
        flex: 1,

        flexDirection: "row",

        justifyContent: "center",

        alignItems: "center",

        alignContent: "center",
    },

    forgotPasswordText: {
        fontSize: theme.text.medium,

        fontWeight: "600",
    },

    image: {
        width: 95,

        height: 15,
    },

    keyboardAwareView: {
        flexGrow: 1,
    },

    sendResetEmail: {
        margin: 0,

        padding: 0,

        paddingHorizontal: theme.baseUnit,
    },

    signInMessageContainer: {
        flexDirection: "row",

        flexWrap: "wrap",

        justifyContent: "center",

        alignSelf: "center",

        width: 266,

        marginTop: 6 * theme.baseUnit,

        marginBottom: 10 * theme.baseUnit,

        marginHorizontal: 27,

        textAlign: "center",

        fontSize: theme.medium,
    },

    signInMessageWord: {
        height: 19,
    },

    cancelButtonText: {
        fontSize: theme.buttonFontSize,

        color: theme.palette.gray, // skip text changed to grey

        fontFamily: "Roboto",

        fontWeight: "bold",
    },
});
