import React , { Component }from 'react';
import {ActivityIndicator, TextInput,StatusBar,Platform,Text, View , TouchableHighlight,TouchableOpacity ,AsyncStorage, Image ,ScrollView,NativeModules,AppRegistry,BackAndroid} from 'react-native';
import styles from './styles';
import images from './../../config/images.js';
import common from './../../config/common.js';

let self;

class PackageCard extends Component {
  //************************************** Constructor start*****************************//
  constructor(props){
    super(props);

    self = this;
  }
  //************************************** Constructor end*****************************//

  //************************************** Function start*****************************//
  //************************************** Function end*****************************//

  //************************************** Render start*****************************//

  render(){
    let {packageDet , setPackageDet , onBlur , onFocus} = this.props;

    return (
      <View style={[styles.userDetViewParent]}>
        <View style={[styles.userDetView,{marginBottom : 5}]}>
          <View style={styles.userDetViewLeft}>
            <Text style={styles.smallText} numberOfLines={1}>Package</Text>
          </View>
          <View style={styles.userDetViewRight}>
            <Text style={styles.smallTextGray} numberOfLines={1}>50 KG</Text>
          </View>
        </View>

        {
          packageDet.map(function(objProperty,index){
            return (
              <View style={styles.userDetView}>
                <View style={styles.userDetViewLeft}>
                  <Text style={styles.smallText} numberOfLines={1}>{objProperty.key}</Text>
                </View>
                <View style={styles.userDetViewRight}>
                  <TextInput
                  ref=""
                    underlineColorAndroid="transparent"
                    editable ={true}
                    style={styles.textInput}
                    // onFocus={()=>onFocus()}
                    // onBlur={()=>onBlur()}
                    onChangeText ={(value) => {
                      packageDet[index].value = value;
                      setPackageDet(packageDet);
                    }}
                    value={packageDet[index].value}
                  />
                  <Text style={styles.smallTextGray} numberOfLines={1}>{objProperty.unit}</Text>
                </View>
              </View>
            )
          })
        }
      </View>
    );
  }
  //************************************** Render end*****************************//
};

export default PackageCard;
