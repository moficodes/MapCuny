import React from "react";
import {
  StyleSheet,
  Text,
  View,
  LayoutAnimation,
  Keyboard
} from "react-native";
import { Button, FormLabel, FormInput, Icon } from "react-native-elements";
import { MapView } from "expo";

import { NYC_OPEN_DATA_API } from "../constants/secret";
import { WIFI_HOTSPOTS_URL, LIBRARY_LOCATIONS_URL } from "../constants/urls";
import library from "../../assets/markers/library.png";
import wifi from "../../assets/markers/wifi.png";
import nightStyle from "../mapstyles/night.json";
import retro from "../mapstyles/retro.json";

const LAT_DELTA = 0.0922;
const LONG_DELTA = 0.0421;
export default class HackathonDemo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      region: {
        latitude: 40.76727216,
        longitude: -73.99392888,
        latitudeDelta: LAT_DELTA,
        longitudeDelta: LONG_DELTA
      },
      isLoadingLib: true,
      isLoadingWiFi: true,
      length: 0,
      pressed: false,
      buttonTitle: "Filter",
      buttonIcon: "filter-list"
    };

    this.zip = "";
    this.textInputRef = null;
  }

  fetchWifiJSONData() {
    let url = `${WIFI_HOTSPOTS_URL}`;
    if (this.zip.length === 5) {
      url = `${WIFI_HOTSPOTS_URL}?zip=${this.zip}`;
    }
    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-App-Token": NYC_OPEN_DATA_API
      }
    })
      .then(response => response.json())
      .then(responseJson => {
        this.processWiFiJson(responseJson);
        console.log(responseJson);
      })
      .catch(error => {
        console.log(error);
      });
  }

  processWiFiJson(responseJson) {
    this.setState({ isLoadingWiFi: false, markerWiFi: responseJson });
  }

  renderWifiMarkers() {
    return this.state.isLoadingWiFi
      ? null
      : this.state.markerWiFi.map((marker, index) => {
          const coords = {
            latitude: marker.location_lat_long.coordinates[1],
            longitude: marker.location_lat_long.coordinates[0]
          };

          return (
            <MapView.Marker
              key={index}
              coordinate={coords}
              title={marker.location_t}
              description={marker.location}
              image={wifi}
            />
          );
        });
  }

  fetchLibraryJSONData() {
    let url = `${LIBRARY_LOCATIONS_URL}`;
    if (this.zip.length === 5) {
      url = `${LIBRARY_LOCATIONS_URL}?zip=${this.zip}`;
    }
    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-App-Token": NYC_OPEN_DATA_API
      }
    })
      .then(response => response.json())
      .then(responseJson => {
        this.processLibraryJson(responseJson);
        console.log(responseJson);
      })
      .catch(error => {
        console.log(error);
      });
  }

  processLibraryJson(responseJson) {
    this.setState({ markerLibrary: responseJson, isLoadingLib: false });
    responseJson.map((marker, index) => {
      if (index == 0) {
        this.setState({
          region: {
            latitude: marker.the_geom.coordinates[1],
            longitude: marker.the_geom.coordinates[0],
            latitudeDelta: LAT_DELTA,
            longitudeDelta: LONG_DELTA
          }
        });
      }
    });
  }

  renderLibraryMarkers() {
    return this.state.isLoadingLib
      ? null
      : this.state.markerLibrary.map((marker, index) => {
          const coords = {
            latitude: marker.the_geom.coordinates[1],
            longitude: marker.the_geom.coordinates[0]
          };

          const metadata = `${marker.housenum} ${marker.streetname}`;

          return (
            <MapView.Marker
              key={index}
              coordinate={coords}
              title={marker.city}
              description={metadata}
              image={library}
            />
          );
        });
  }

  onButtonPress() {
    LayoutAnimation.spring();
    this.textInputRef.clearText();
    if (!this.state.pressed) {
      this.setState({
        length: 150,
        pressed: true,
        buttonTitle: "Save",
        buttonIcon: "save"
      });
    } else {
      Keyboard.dismiss();
      this.fetchLibraryJSONData();
      this.fetchWifiJSONData();
      this.setState({
        length: 0,
        pressed: false,
        buttonTitle: "Filter",
        buttonIcon: "filter-list"
      });
    }
  }

  zipChanged(change) {
    this.zip = change;
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.container}
          provider="google"
          region={this.state.region}
          customMapStyle={retro}
        >
          {this.renderLibraryMarkers()}
          {this.renderWifiMarkers()}
        </MapView>
        <View style={{ height: 40 }} />
        <Button
          style={styles.buttonStyle}
          title={this.state.buttonTitle}
          titleStyle={{ fontWeight: "700" }}
          buttonStyle={styles.innerStyle}
          iconRight={{ name: this.state.buttonIcon, type: "material-icons" }}
          containerStyle={{ marginTop: 20 }}
          onPress={this.onButtonPress.bind(this)}
        />
        <View style={[styles.viewStyle, { height: this.state.length }]}>
          <FormLabel>Zip</FormLabel>
          <FormInput
            keyboardType="numeric"
            onChangeText={this.zipChanged.bind(this)}
            ref={textRef => (this.textInputRef = textRef)}
          />
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  buttonStyle: {
    flex: 1,
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    height: 20
  },
  innerStyle: {
    backgroundColor: "rgba(92, 99,216, .2)",
    height: 45,
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 5
  },
  viewStyle: {
    position: "absolute",
    top: 145,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderColor: "transparent"
  }
};
