import { StyleSheet , Dimensions } from 'react-native';
import common from './../../config/common.js';

let window = Dimensions.get("window");

export default StyleSheet.create({
  userDetViewParent : {
    margin : 15,
    width : window.width - 30,
    // borderRadius : 5,
    // borderColor : 'rgb(151,151,151)',
    // borderWidth : 2,
    padding : 5
  },
  userDetView : {
    width : window.width - 30,
    flexDirection : 'row',
    paddingVertical : 3
  },
  userDetViewLeft : {
    flex : 1,
    paddingLeft : 10
  },
  userDetViewRight : {
    flex : 1,
    paddingLeft : 10,
    flexDirection : "row"
  },
  smallText : {
    color : common.appMainColor,
    paddingVertical : 8,
    fontSize : 16
  },
  smallTextGray : {
    color : 'rgb(151,151,151)',
    paddingVertical : 8,
    fontSize : 16
  },
  textInput : {
    height: 40,
    width : 70,
    borderColor: 'rgb(151,151,151)',
    borderWidth: 1,
    // backgroundColor : 'white',
    borderRadius : 5,
    marginBottom : 10,
    paddingLeft : 5,
    marginRight : 10,
    color : 'rgb(151,151,151)',
    fontSize : 16
  },
});
