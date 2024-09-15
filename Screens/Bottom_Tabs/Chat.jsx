import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { StreamChat } from 'stream-chat';
import { ChannelListContext, Chat } from 'stream-chat-react';
import Cookies from 'universal-cookie'

import { ChannelListContainer, ChannelContainer} from "./components"

import "./Chat.css"


const apiKey = '7bk7snvne6w9'

const clientSide = StreamChat.getInstance(apiKey)
const Chat = () => {
  return (
    <div className = "campus_connect_wrapper">
        <Chat client = {client} theme = "team light">
            <ChannelListContainer
            
            />
            <ChannelContainer
            
            />
        </Chat>
    </div>
  )
}

export default Chat

const styles = StyleSheet.create({})