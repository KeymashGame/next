import {MouseEvent, useCallback, useEffect, useRef, useState} from 'react';
import { useTranslation } from 'next-i18next';
import {faBook, faQuoteRight, faCircleNotch, faBahai, faTrophy} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faList,
    faPlusSquare,
    faRandom,
} from '@fortawesome/free-solid-svg-icons';
import axios, { CancelTokenSource } from 'axios';
import Config from '../../Config';
import LobbiesRow from '../Custom/LobbiesRow';
import {LobbyData, PlayerLevelData} from "../../types.client.mongo";
import {usePlayerContext} from "../../contexts/Player.context";
import useCSRF from "../../hooks/useCSRF";
import useConfig from "../../hooks/useConfig";
import { toast } from 'react-toastify';
import Redirect from '../Uncategorized/Redirect';
import Modal from '../Uncategorized/Modal';
import RankedModal from './RankedModal';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';

interface TabsInterface {
    name: string;
    description: string;
    enabled: boolean;
    content?: boolean;
    image?: string;
    modes?: {
        name: string;
        description?: string;
        icon: IconDefinition;
        textType?: number;
        color: string;
        badge?: string | number;
        disabled?: {
            level: number;
            isGuest: boolean;
        }
        onClick?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined
    }[];
}

interface IProps {
    mode?: string;
}

const Queue = (props: IProps) => {
    const axiosCancelSource = useRef<CancelTokenSource | null>();

    const { sessionData, inQueue, setInQueue } = usePlayerContext();
    const { _csrf } = useCSRF();
    const { world, networkStrength } = useConfig();
    const { t } = useTranslation();

    const [ tab, setTab ] = useState(0);
    const [ playerLevel, setPlayerLevel ] = useState<PlayerLevelData | null>(null);
    const [ playerRank, setPlayerRank ] = useState<string>('Unrated');
    const [ lobbiesData, setLobbiesData ] = useState<LobbyData[]>([]);
    const [ lobbiesLoaded, setLobbiesLoaded ] = useState(false);
    const [ modal, setModal ] = useState<number | null>(null);
    const [ redirect, setRedirect ] = useState('');
    const [ loading, setLoading ] = useState<number | null>(null);

    const { mode } = props;

    const getLevel = useCallback(() => {
        if (sessionData) {
            axios.get(`${Config.apiUrl}/player/ranked`, {withCredentials: true, cancelToken: axiosCancelSource.current?.token})
                .then((response) => {
                    console.log('ranked');
                    console.log(response);
                    if (!response.data.error) {
                        setPlayerLevel(response.data.Level);
                        setPlayerRank(response.data?.Rank?.Rank || 'Unrated');
                        console.log(response.data);
                    } else
                        console.log(response.data.error);
                })
                .catch((e) => console.log(e));
        }
    }, [ sessionData ]);

    const pingCreateMatch = useCallback(async (textType: string) => {
        setLoading(1);

        let text = 0;
        if (textType === 'regular') text = 1;
        if (textType === 'dictionary') text = 2;

        const postData = {
            _csrf,
            worldId: world,
            flagId: 0,
            modeId: 0,
            networkStrength, 
            locale: "en",
            textType: text,
        };

        axios.post(`${Config.apiUrl}/match/search`, postData, { withCredentials: true, cancelToken: axiosCancelSource.current?.token })
            .then((response) => {
                if (!response.data.error) {
                    setLoading(2);
                    setRedirect(`/game/${textType}`);
                } else {
                    setLoading(null);
                    toast.error(response.data.error);
                }
            })
            .catch((e) => {
                toast.error(e.message || 'Unknown error occured, please try again later!');
                setLoading(null);
            })
    }, [ _csrf, world ]);

    useEffect(() => {
        if (mode)
            pingCreateMatch(mode).then();
    }, [ mode, pingCreateMatch ]);

    useEffect(() => {
        axiosCancelSource.current = axios.CancelToken.source();

        getLevel();
        getLobbies();

        return () => axiosCancelSource.current?.cancel();
    }, [ getLevel ]);
    
    const getLobbies = () => {
        axios
            .get(`${Config.apiUrl}/lobby/list`, { cancelToken: axiosCancelSource.current?.token })
            .then(response => {
                if (response.data) {
                    setLobbiesData(response.data);
                    setLobbiesLoaded(true);
                }
            })
            .catch(e => console.log(e));
    }

    const tabs: TabsInterface[] = [
        {
            name: 'page.queue.quickplay.title',
            description: 'page.queue.quickplay.description',
            image: '/assets/play/quick_play.svg',
            enabled: (loading === null),
            modes: [
                {
                    name: 'page.queue.random.title',
                    description: 'page.queue.random.description',
                    icon: faRandom,
                    textType: 0,
                    color: 'text-teal-500',
                    onClick: () => pingCreateMatch('random'),
                },
                {
                    name: 'page.queue.quotes.title',
                    description: 'page.queue.quotes.description',
                    icon: faQuoteRight,
                    textType: 1,
                    color: 'text-purple-500',
                    onClick: () => pingCreateMatch('regular'),
                },
                {
                    name: 'page.queue.dictionary.title',
                    description: 'page.queue.dictionary.description',
                    icon: faBook,
                    textType: 2,
                    color: 'text-blue-500',
                    onClick: () => pingCreateMatch('dictionary'),
                },
            ],
        },
        {
            name: 'page.queue.custom.title',
            enabled: (loading === null),
            description: 'page.queue.custom.description',
            image: '/assets/play/custom.svg',
            modes: [
                {
                    name: 'page.queue.custom.create',
                    icon: faPlusSquare,
                    color: 'text-yellow-500',
                    onClick: () => setRedirect('/custom'),
                },
                {
                    name: 'page.queue.custom.browse',
                    icon: faList,
                    color: 'text-teal-500',
                    badge: lobbiesData?.length || 0,
                    onClick: () => setTab(1),
                },
            ],
        },
        {
            name: 'page.queue.ranked.title',
            description: 'page.queue.ranked.description',
            image: `/ranks/${(playerRank || 'Unrated').replaceAll(' ', '').toLowerCase()}.svg`,
            enabled: (loading === null),
            content: true,
            modes: [
                {
                    name: 'page.queue.ranked.join',
                    icon: faBahai,
                    textType: 2,
                    color: 'text-pink-500',
                    onClick: () =>  setInQueue(true),
                    disabled: {
                        level: !inQueue ? 5 : 99999,
                        isGuest: true
                    },
                },
                {
                    name: 'component.navbar.leaders',
                    icon: faTrophy,
                    color: 'text-yellow-400',
                    onClick: () => setRedirect('/leaderboards/ranked/4'),
                },
                {
                    name: 'page.queue.ranked.info',
                    icon: faQuestionCircle,
                    color: 'text-blue-400',
                    onClick: () => setModal(0),
                },
            ],
        },
    ];

    return (
        <>
            {redirect && redirect !== '' && <Redirect to={redirect} />}
            <RankedModal isLoaded={modal === 0} toggle={() => setModal(null)} />
            <div style={{ zIndex: 100 }} className={`${loading !== null ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition ease-in-out duration-200 fixed inset-0 w-full h-screen bg-black bg-opacity-40`}>
                <div className={"flex h-screen"}>
                    <div className={"m-auto w-11/12 sm:w-1/2 lg:w-1/3 xl:w-1/3 2xl:w-4/12 3xl:w-96 px-4 py-12 xl:py-16 rounded-2xl shadow-lg bg-gray-750"}>
                        <div className="text-center">
                            <FontAwesomeIcon icon={faCircleNotch} className={"text-orange-400 text-center"} size={"6x"} spin />
                            <div className="h2 mt-10">
                                {loading === 2 ? 'Joining Match' : 'Finding Match'}
                            </div>
                            <p className="mt-4">Get ready to start typing!</p>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpened={(lobbiesLoaded && tab === 1)} onClose={() => setTab(0)}>
                <div className="h3 mb-4">{t('page.queue.custom.public')}</div>
                <div style={{ height: '70vh' }} >
                    {lobbiesData.length !== 0
                        ? lobbiesData.map(row => <LobbiesRow key={row.invite} {...row} />)
                        : <div className="py-32 w-full bg-black-light text-sm uppercase text-white font-semibold text-center">{t('page.queue.custom.none')}</div>
                    }
                </div>
            </Modal>

            <audio id="MatchFound" src="/audio/MatchFound.wav" crossOrigin="anonymous" preload="auto" />

            <div className={"grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4 mb-4 content-box"} style={{ paddingLeft: 0, paddingRight: 0 }}>
                {tabs.map((tab, index) => (
                    <div key={index} className={`relative col-span-full lg:col-span-1 px-8 text-center lg:text-left`}>
                        {/* Custom Border */}
                        {index !== 0 && <div className="hidden lg:block h-full border-r-4 rounded-full border-gray-800 absolute -left-2.5 z-20" />}
                        {/* Flex / Icon */}
                        <div className="relative">
                            <div className="h1 text-white relative z-10 inline relative">
                                {t(tab?.name)}
                                <div className="absolute top-0 bottom-0 -right-10 lg:-right-14">
                                    <img className={"h-8 xl:h-10 object-cover mt-1 md:mt-2"} src={tab.image || ''} alt={t(tab?.name)} />
                                </div>
                            </div>
                            <p className="pt-2 pb-6 block relative z-10 text-gray-300 truncate">
                                {t(tab?.description)}
                            </p>
                            {/* Buttons */}
                            <div className="flex flex-wrap space-x-1 relative z-10 justify-center lg:justify-start">
                                {tab?.modes?.map((item) => (
                                    <button key={item.name} onClick={item.onClick} className={`py-2 px-4 bg-gray-825 bg-opacity-90 hover:bg-opacity-70 rounded-lg transition ease-in-out duration-200 ${(item.disabled && sessionData && ((playerLevel !== null && playerLevel?.Index) < item.disabled.level || sessionData.authName === 'Guest')) ? 'pointer-events-none opacity-80' : ''}`}>
                                        <div className={"flex justify-center text-white text-xs uppercase font-semibold"}>
                                            <div className={`w-4 text-center ${item.name ? 'mr-0.5 sm:text-left lg:text-center 3xl:text-left' : ''}`}>
                                                <FontAwesomeIcon icon={item.icon} className={`${(item.disabled && sessionData && ((playerLevel !== null && playerLevel?.Index) < item.disabled.level || sessionData.authName === 'Guest')) ? 'text-gray-600' : item.color}`} />
                                            </div>
                                            {item.name && (
                                                <div className={"hidden sm:block lg:hidden 3xl:block w-auto"}>
                                                    {t(item.name)}
                                                    {typeof item.badge !== 'undefined' && (
                                                        <span className="ml-1.5 bg-gray-700 px-1.5 pb-0.5 pt-px text-xs rounded">
                                                            {item.badge || 0}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Queue;
