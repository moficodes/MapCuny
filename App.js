import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MapView } from "expo";

import BikeNYC from "./src/components/BikeNYC";

export default class App extends React.Component {
  render() {
    return (
      <BikeNYC />
    );
  }
}
