import React, {useState, useEffect, useRef, useCallback} from 'react';
import { useTranslation } from 'next-i18next';
import axios, {CancelTokenSource} from "axios";
import Config from "../Config";
import {faBell, faCog, faShoppingCart, faSignInAlt, faSignOutAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import Socket from "../utils/socket/Socket";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Notification from "../components/Uncategorized/Notification";
import {usePlayerContext} from "../contexts/Player.context";
import usePlayerToken from "../hooks/usePlayerToken";
import {PlayerNotificationData} from "../types.client.mongo";
import PlayerAvatar from "../components/Player/PlayerAvatar";
import SettingsFrame from "../components/Settings/SettingsFrame";
import Link from '../components/Uncategorized/Link';

interface IProps {
    isSidebar?: boolean;
}

const Userbar = (props: IProps) => {
    const axiosCancelSource = useRef<CancelTokenSource | null>();

    const { playerToken } = usePlayerToken();
    const { sessionData, isGuest } = usePlayerContext();
    const { t } = useTranslation();

    const [ socket, setSocket ] = useState<Socket | null>(null);
    const [ notificationsList, setNotificationsList ] = useState<PlayerNotificationData[]>([]);
    const [ notificationsCount, setNotificationsCount ] = useState(0);
    const [ notificationsLoaded, setNotificationsLoaded ] = useState(false);
    const [ toggleNotifications, setToggleNotifications ] = useState(false);
    const [ toggleSignIn, setToggleSignIn ] = useState(false);
    const [ isLoaded, setIsLoaded ] = useState(false);
    const { isSidebar } = props;

    /* --------- Settings */
    const [ showSettings, setShowSettings ] = useState<boolean>(false);

    useEffect(() => {
        axiosCancelSource.current = axios.CancelToken.source();

        if (window) {
            setSocket(new Socket(`${Config.gameServer.URL}${Config.gameServer.Port !== null ? `:${Config.gameServer.Port}` : ''}/account`, {
                transports: ['websocket', 'polling'],
            }));
            setIsLoaded(true);
            window.addEventListener('click', notificationToggleManual);
        }

        return () => {
            axiosCancelSource.current?.cancel();
            window.removeEventListener('click', notificationToggleManual);
        }
    }, [ ]);

    const logoutNow = () => {
        axios.get(`${Config.oauthUrl}/logout`, { withCredentials: true, })
            .then(() => window.location.reload())
            .catch(() => window.location.reload())
    }

    const notificationsEffect = useCallback(() => {
        if (socket && !toggleNotifications)
            socket?.emit('readNotifications', {});
    }, [ toggleNotifications, socket ]);

    useEffect(() => {
        notificationsEffect();
    }, [ notificationsEffect ]);

    useEffect(() => {
        socket?.onError(() => console.log('[Notifications] errored'));
        socket?.emit('joinNotifications', { playerToken });
        socket?.on('updateNotifications', async (data: { unread: number, data: PlayerNotificationData[] }) => {
            setNotificationsList(data.data);
            setNotificationsCount(data.unread);
            setNotificationsLoaded(true);
        });
        return () => socket?.disconnect();
    }, [socket, playerToken]);

    const deleteNotifications = async () => socket?.emit('deleteNotifications', {});

    const notificationToggleManual = (e: MouseEvent) => {
        if ((e.target as Element).classList.contains('notificationsWrapper'))
            setToggleNotifications(false);
    }

    const playerItems = [
        {
            title: 'component.navbar.logout',
            icon: { name: faSignOutAlt },
            target: '_self',
            route: ``,
            onClick: () => logoutNow(),
            isAuth: true
        },
        {
            title: 'component.navbar.shop',
            icon: { name: faShoppingCart },
            target: '_self',
            route: '/shop',
            isAuth: true,
        },
        {
            title: 'component.navbar.settings',
            icon: { name: faCog },
            target: '_self',
            route: '',
            onClick: () => setShowSettings(true),
            isAuth: true,
        },
        {
            title: 'component.navbar.notifications',
            icon: { name: faBell, css: 'text-pink-700' },
            target: '_self',
            route: '',
            onClick: () => setToggleNotifications(!toggleNotifications),
            isAuth: true,
        },
        {
            title: 'component.navbar.login',
            icon: { name: faSignInAlt, css: 'text-gray-300' },
            target: '_self',
            route: '/auth/login',
            isAuth: false,
        },
    ];

    return (
        <>
            {!isGuest && <SettingsFrame isVisible={showSettings} onClose={() => setShowSettings(false)} />}
            {(isLoaded && toggleNotifications) && <div className={"notificationsWrapper fixed z-10 top-0 right-0 left-0 bottom-0 w-screen h-screen "} />}
            {(isLoaded && sessionData) && (
                <div className={`flex flex-wrap ${isSidebar ? 'flex-row-reverse justify-center gap-y-4 lg:gap-y-0' : 'justify-center lg:justify-end'}`}>
                    {(sessionData && isGuest) ? (
                        <>
                            <div className={`w-auto my-auto`}>
                                <div className="hidden lg:flex text-base text-white font-semibold tracking-wider">
                                    <div className={"w-8"}>
                                        <PlayerAvatar />
                                    </div>
                                    <div className={"w-auto my-auto pl-2"}>
                                        {sessionData.name}
                                    </div>
                                </div>
                            </div>
                            <div className={`w-auto relative ${isSidebar? 'pl-0 lg:pl-3' : 'pl-3'}`}>
                                <Link to="/auth/login" className="block focus:outline-none text-base hover:bg-gray-775 rounded tracking-wider uppercase py-2 px-3 hover:opacity-70 transition ease-in-out duration-200 text-white font-semibold">
                                    <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                                    <span>{t('component.navbar.login')}</span>
                                </Link>
                                <div className={`w-40 dropdown ${toggleSignIn ? 'is-active' : 'is-not'}`}>
                                    {playerItems[playerItems.length - 1]?.submenu?.map((item) => (
                                        <a key={"userbar" + item.name} href={item.route} className={"item"}>
                                            <div className={"flex"}>
                                                <div className={"w-auto pr-2"}>
                                                    <FontAwesomeIcon icon={item.icon.name} className={item.icon.css} />
                                                </div>
                                                <div className={"w-auto"}>
                                                    {item.name}
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : playerItems.map(item => ((!item.isAuth && isGuest) || (!isGuest && item.isAuth)) && (
                        <div key={"userbar" + item.title} className={`w-auto my-auto ${isSidebar? 'pl-0 lg:pl-3' : 'pl-3'}`}>
                            {!item.onClick ? (
                                <Link to={item.route} className={`activeClassName[text-orange-400] nav-link text-white text-xl rounded tracking-wider uppercase px-1 hover:text-orange-400 transition ease-in-out duration-300 font-semibold`}>
                                    <FontAwesomeIcon icon={item.icon.name} />
                                </Link>
                            ) : (
                              <div className="relative">
                                  <button type="button" onClick={item.onClick} className={`nav-link ${(item.title === 'component.navbar.notifications' && toggleNotifications) ? 'text-orange-400' : 'text-white'} hover:text-orange-400 text-xl rounded tracking-wider uppercase px-1 hover:text-orange-400 transition ease-in-out duration-300 font-semibold`}>
                                      <FontAwesomeIcon icon={item.icon.name} />
                                      {item.title === 'component.navbar.notifications' && notificationsCount > 0 && (
                                          <div className="absolute -bottom-px right-0 border-2 border-gray-775 bg-blue-400 rounded-full h-3 w-3 flex items-center justify-center" />
                                      )}
                                  </button>
                                  {item.title === 'component.navbar.notifications' && (
                                        <div className={`${toggleNotifications ? 'is-active' : 'is-not'} dropdown dropdown-2xl w-128 shadow-lg right-0`}>
                                            <div className={"bg-gray-700 rounded-t-lg shadow flex py-2 px-4"}>
                                                <div className={"w-auto mr-auto"}>
                                                    <span className={"text-base  text-white uppercase font-semibold"}>
                                                        {t('component.navbar.notifications')}
                                                    </span>
                                                </div>
                                                <div className={"w-auto my-auto"}>
                                                    <button className={"focus:outline-none text-orange-400 hover:opacity-70 transition ease-in-out duration-300"} type={"button"} onClick={deleteNotifications}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </div>
                                            {notificationsLoaded && (
                                                <div className={"h-96 bg-gray-750 rounded-b-2xl overflow-y-scroll overflow-x-hidden"}>
                                                    {notificationsList.length !== 0 
                                                        ? notificationsList.map((row, index) => <Notification key={"notification" + (row._id || index)} {...row} />)
                                                        : <div className="pt-16 text-center">You have no notifications!</div>
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    )}
                              </div>
                            )}
                        </div>
                    ))}
                    {!isGuest && (
                      <Link to={`/profile/${sessionData.name}-${sessionData.discriminator}`} className={`flex w-auto my-auto ${isSidebar? 'pl-0 lg:pl-3' : 'pl-3'}`}>
                          <div className={'block w-10 my-auto p-0.5 border-2 border-gray-500 border-opacity-50 hover:border-orange-400 hover:border-opacity-50 transition ease-in-out duration-200 rounded-full'}>
                              <PlayerAvatar source={sessionData.avatarSrc} hideBorder />
                          </div>
                      </Link>
                    )}
                    
                </div>
            )}
        </>
    )
}

export default Userbar;
