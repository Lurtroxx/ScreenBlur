import { StyleSheet, AppState, Image, Dimensions, View, Text } from "react-native";
import React, { PureComponent } from 'react'
import { BlurView } from "@react-native-community/blur"

var uri = "https://www.hotelpalomar-sandiego.com/images/tout/kimpton-hotel-palomar-san-diego-pier-b6a08a84.jpg";
const windowHeight = Math.round(Dimensions.get('window').height);
const windowWidth = Math.round(Dimensions.get('window').width);
export class TabOneScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.appState = React.createRef(AppState.currentState)
    this.state = {
      appStateVisible: AppState.currentState,
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appStateVisible !== nextAppState) {
      this.setState({ appStateVisible: nextAppState });
    }
    console.log(this.state.appStateVisible)
  }

  render() {
    return (
      <View style={styles.container}>


        <Image source={{ uri: uri }} style={{ width: windowWidth, height: windowHeight }} />
        <View style={{ height: '100%', width: '100%', position: 'absolute', justifyContent: 'flex-start', alignContent: 'center' }}>
          <Text style={{ textAlign: 'center', fontSize: 30, color: 'white' }}>{this.state.appStateVisible}</Text>
        </View>
        {this.state.appStateVisible === 'inactive' && <>
          <BlurView
            style={styles.absolute}
            // viewRef={this.state.viewRef}
            blurType="light"
            blurAmount={100}
          // reducedTransparencyFallbackColor="white"
          />
          <View style={{ height: '100%', width: '100%', position: 'absolute', justifyContent: 'flex-start', alignContent: 'center' }}>
            <Text style={{ textAlign: 'center', fontSize: 30, color: 'white' }}>{this.state.appStateVisible}</Text>
          </View>
        </>
        }

      </View>
    );
  }

}


// export const TabOneScreen = () => {
//   const appState = useRef(AppState.currentState);
//   const [appStateVisible, setAppStateVisible] = useState(appState.current);

//   useEffect(() => {
//     AppState.addEventListener("change", _handleAppStateChange);

//     return () => {
//       AppState.removeEventListener("change", _handleAppStateChange);
//     };
//   }, []);

//   const _handleAppStateChange = (nextAppState) => {
//     if (
//       appState.current.match(/inactive|background/) &&
//       nextAppState === "active"
//     ) {
//       console.log("App has come to the foreground!");
//     }

//     appState.current = nextAppState;
//     setAppStateVisible(appState.current);
//     console.log("AppState", appState.current);
//   };

//   return (
//     <View style={styles.container}>
//       {appStateVisible == "background" || appStateVisible == "inactive" ?
//         <Text>Current state is: {appStateVisible}</Text> : <BlurryView />
//       }
//     </View>
//   );
// };

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center"
  },
  absolute: {
    position: "absolute",
    height: windowHeight,
    width: windowWidth,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }
});