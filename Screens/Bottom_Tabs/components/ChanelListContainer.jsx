import React from 'react'
import { ChannelList, useChatContext } from 'stream-chat-react';
import Cookies from 'universal-cookie';

import { ChannelSearch, TeamChannelList, TeamChannelPreview } from './' ;
import CampusConnectIcon from '../assets/complete.png'
import LogoutIcon from '../assets/logout.png'

// sidebar to show list of chat rooms for each user(by course)
const sidebar = () => (
    <div className = "campus_connect_chat_sidebar">
        <div className = "campus_connect_chat_sidebar_icon1">
            <div className = "campus_connect_chat_sidebar_icon1_inner">
            <img src = {CampusConnectIcon} alt = "CampusConnect" width ="30"/>
            </div>
        </div>
        <div className = "campus_connect_chat_sidebar_icon2">
            <div className = "campus_connect_chat_sidebar_icon2_inner">
            <img src = { LogoutIcon } alt = "Logout" width ="30"/>
            </div>
        </div>
    </div>
)

const CampusConnectHeader = () => (
    <div className = "campus_connect_list_header">
        <p className = "campus_connect_list_header_text">
            Campus Connect ChatRoom
        </p>
    </div>
)
const ChanelListContainer = () => {
  return (
    <>
        <sidebar />
        <div className = "campus_connect_list_wrapper">
            <CampusConnectHeader />
        </div>
    </>
  )
}

export default ChanelListContainer
