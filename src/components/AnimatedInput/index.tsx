import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  ForwardedRef,
} from "react";
import { TextInputProps } from "react-native";
import {
  View,
  TextInput,
  Animated,
  Text,
  ColorValue,
  StyleSheetProperties,
  ViewStyle,
  TextStyle,
  TextInputAndroidProps,
} from "react-native";
import {
  TextInputMask,
  TextInputMaskTypeProp,
  TextInputMaskOptionProp,
} from "react-native-masked-text";
import styles from "./styles";

interface AnimatedInputType extends TextInputProps {
  placeholder: string;
  errorText?: string;
  valid?: boolean;
  errorColor?: ColorValue;
  disabled?: boolean;
  value?: string;
  prefix?: string;
  sufix?: string;
  styleInput?: TextStyle;
  styleLabel?: TextStyle;
  styleError?: TextStyle;
  styleContent?: ViewStyle;
  styleBodyContent?: ViewStyle;
  innerRef?: ForwardedRef<any>;
  selectionColor?: ColorValue;
  labelInitialSize?: number;
  labelFinalSize?: number;
  textInputFontSize?: number;
  mask?: TextInputMaskTypeProp;
  maskOptions?: TextInputMaskOptionProp;
  others?: any;
}

const AnimatedTextInput = ({
  placeholder,
  errorText,
  valid,
  errorColor,
  disabled,
  value,
  prefix,
  sufix,
  styleInput,
  styleLabel,
  styleError,
  styleContent,
  styleBodyContent,
  innerRef,
  selectionColor,
  labelInitialSize,
  labelFinalSize,
  textInputFontSize,
  mask,
  maskOptions = {},
  ...others
}: AnimatedInputType) => {
  const [showInput, setShowInput] = useState(false);
  const [showError, setShowError] = useState(false);
  const [animatedIsFocused] = useState(new Animated.Value(1));
  const [isInputFocused, setInputFocus] = useState(false);

  const inputFontSize = styleLabel?.fontSize || styles.label.fontSize;
  const labelFontSize = styleLabel?.fontSize || styles.label.fontSize;
  const errorFontSize = styleError?.fontSize || styles.error.fontSize;

  const onBlur = () => {
    setInputFocus(false);
    if (!value) {
      setShowInput(false);
      setShowError(false);
      startAnimation();
    }
  };

  const onFocus = () => {
    setInputFocus(true);
    if (!showInput) {
      startAnimation();
    }
  };

  const borderColor = () => {
    const borderStyle: {
      borderBottomColor: ColorValue;
    } = {
      borderBottomColor: "",
    };

    borderStyle.borderBottomColor =
      styleBodyContent?.borderBottomColor ||
      styles.bodyContent.borderBottomColor;
    if (showError) {
      borderStyle.borderBottomColor = errorColor || "#d32f2f";
    }
    return borderStyle;
  };

  const setContentHeight = () => {
    const fontsHeight = labelFontSize + inputFontSize + errorFontSize + 10;
    const internalVerticalSpaces = 16;
    return fontsHeight + internalVerticalSpaces;
  };

  const getErrorContentSpace = () => {
    return errorFontSize + 2;
  };

  const startAnimation = useCallback(() => {
    Animated.timing(animatedIsFocused, {
      useNativeDriver: false,
      toValue: showInput ? 1 : 0,
      duration: 150,
    }).start(() => {
      if (!showInput) {
        setShowInput(true);
      }
    });
  }, [animatedIsFocused, showInput]);

  const animationView = useCallback(() => {
    const sizeShow = 15 + labelFontSize + inputFontSize + 5;
    const sizeHide = 15 + labelFontSize;
    const inputAdjust = {
      height: animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [sizeShow, sizeHide],
      }),
    };
    return inputAdjust;
  }, [animatedIsFocused, inputFontSize, labelFontSize]);

  const animationLabelFontSize = useCallback(() => {
    const fontAdjust = {
      fontSize: animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [
          labelFinalSize || labelFontSize,
          labelInitialSize || inputFontSize,
        ],
      }),
    };
    return fontAdjust;
  }, [animatedIsFocused, inputFontSize, labelFontSize]);

  useEffect(() => {
    setShowError(!valid);
    if (value) {
      setShowInput(true);
    }
    if (value && !showInput) {
      startAnimation();
    }
    animationView();
  }, [
    valid,
    value,
    animationView,
    animationLabelFontSize,
    animatedIsFocused,
    startAnimation,
    showInput,
  ]);

  return (
    <View
      style={[styles.content, styleContent, { height: setContentHeight() }]}
    >
      <Animated.View
        style={[
          styles.bodyContent,
          styleBodyContent,
          borderColor(),
          {
            marginBottom: showError ? 0 : getErrorContentSpace(),
            borderBottomWidth: isInputFocused ? 1.5 : 0.5,
          },
          animationView(),
        ]}
      >
        <View style={styles.wrapper}>
          <Animated.Text
            style={[styles.label, styleLabel, animationLabelFontSize()]}
            onPress={() => !disabled && onFocus()}
          >
            {placeholder}
          </Animated.Text>
          {showInput && (
            <View style={styles.toucheableLineContent}>
              <Text
                style={[
                  styles.prefix,
                  styleInput,
                  !!textInputFontSize && { fontSize: textInputFontSize },
                ]}
              >
                {prefix}
              </Text>

              {!!mask ? (
                <TextInputMask
                  {...others}
                  value={value}
                  pointerEvents={disabled ? "box-none" : "auto"}
                  selectionColor={selectionColor}
                  autoFocus
                  blurOnSubmit
                  editable={!disabled}
                  onBlur={() => onBlur()}
                  style={[
                    styles.input,
                    styleInput,
                    !!textInputFontSize && { fontSize: textInputFontSize },
                  ]}
                  onEndEditing={() => {
                    onBlur();
                  }}
                  type={mask || "cpf"}
                  options={maskOptions}
                  ref={innerRef}
                />
              ) : (
                <TextInput
                  {...others}
                  value={value}
                  pointerEvents={disabled ? "box-none" : "auto"}
                  selectionColor={selectionColor}
                  autoFocus
                  blurOnSubmit
                  editable={!disabled}
                  onBlur={() => onBlur()}
                  style={[styles.input, styleInput]}
                  onEndEditing={() => onBlur()}
                  ref={innerRef}
                />
              )}
            </View>
          )}
        </View>
        <View style={styles.sufix}>{sufix}</View>
      </Animated.View>
      {showError && (
        <Text
          style={[
            styles.error,
            !!errorColor && { color: errorColor },
            styleError,
          ]}
        >
          {errorText}
        </Text>
      )}
    </View>
  );
};

const AnimatedInput = forwardRef((props: AnimatedInputType, ref) => (
  <AnimatedTextInput {...props} innerRef={ref} />
));

AnimatedInput.defaultProps = {
  valid: true,
  disabled: false,
  value: "",
  styleInput: {},
  styleBodyContent: {},
  styleLabel: {},
  styleError: {},
};

export default AnimatedInput;
