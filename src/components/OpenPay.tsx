import { StyleSheet, Text, View, Platform } from "react-native";
import React, { useState, useEffect } from "react";

import "react-native-get-random-values";
import { WebView } from "react-native-webview";

import sprintfJs from "sprintf-js";
import * as Application from "expo-application";

import uuid from "react-native-uuid";
import { MERCHANT_ID } from "../../constants/keys";

const vsprintf = sprintfJs.vsprintf;
let sessionId = uuid.v4() as string;
sessionId = sessionId.toUpperCase().replace(/-/g, "");

type OpenpayProps = {
  onCreateSesionID: (tok: string) => void;
  isProductionMode: boolean;
};

export default function ({ onCreateSesionID, isProductionMode }: OpenpayProps) {
  const API_URL_SANDBOX = "https://sandbox-api.openpay.mx";
  const API_URL_PRODUCTION = "https://api.openpay.mx";

  const [state, setState] = useState<{ uri: any; injectedJavaScript: any }>();

  const getIdentifierForVendor = async () => {
    let deviceSerial: any = "";
    try {
      if (Platform.OS === "android") {
        deviceSerial = Application.androidId;
      } else if (Platform.OS === "ios") {
        deviceSerial = await Application.getIosIdForVendorAsync();
      } else {
        throw new Error("El dispositivo no es ni android ni IOS");
      }
    } catch (e) {
      console.log("error reading device ID", e);
      alert(
        "Error leyendo el identificador del dispositivo, comunicate con los desarrolladores"
      );
    }

    return deviceSerial;
  };

  useEffect(() => {
    createDeviceSessionId();
  }, []);

  const createDeviceSessionId = async () => {
    let identifierForVendor = await getIdentifierForVendor();
    identifierForVendor = identifierForVendor.replace(/-/g, "");

    const uri = vsprintf("%s/oa/logo.htm?m=%s&s=%s", [
      isProductionMode ? API_URL_PRODUCTION : API_URL_SANDBOX,
      MERCHANT_ID,
      sessionId,
    ]);
    const injectedJavaScript = vsprintf('var identifierForVendor = "%s";', [
      identifierForVendor,
    ]);

    setState(() => ({ uri, injectedJavaScript }));

    onCreateSesionID(sessionId);
  };

  return (
    <View>
      <WebView
        style={{ opacity: 0.99 }}
        source={{ uri: state?.uri }}
        injectedJavaScript={state?.injectedJavaScript}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
