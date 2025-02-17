import type {NextPage} from 'next';
import styles from '../styles/Index.module.css';
import Countdown from '../components/countdown'
import FarmRow from '../components/farmRow'
import {useEffect, useState} from "react";
import {staking, weth} from "../const/const";
import {chainlinkLatestAnswer} from '../helpers/erc20'
import aprCalc from '../helpers/apr'
import {BigNumber} from 'ethers'
import Value from "../components/value";
import LoadingSpinner from "../components/loadingSpinner";
import {useProvider} from "wagmi";

const expectedMergeDate = "2022-09-15T04:20:00Z"


const Home: NextPage = () => {

    const provider = useProvider()

    const [init, setInit] = useState(false)
    const [tvl, setTvl] = useState(BigNumber.from(0))
    const [loading, setLoading] = useState(true)
    const [wethwETH, setWethwETH] = useState("0")
    const [wethsETH, setWethsETH] = useState("0")
    const [phiETH, setPhiETH] = useState(0)
    const [phisPHI, setPhisPHI] = useState("0")
    const [phiwPHI, setPhiwPHI] = useState("0")
    const [lpsLp, setLpsLp] = useState("0")
    const [lpwLp, setLpwLp] = useState("0")
    const [ethUsdPrice, setEthUsdPrice] = useState(BigNumber.from(0))

    useEffect(() => {
        let priceInterval = setInterval(() => {
            chainlinkLatestAnswer(provider).then((price: BigNumber) => {
                if (!ethUsdPrice.eq(price)) {
                    setEthUsdPrice(price.div(1e8))
                }
            }).catch((err) => console.error(err))
        }, 100000)

        //Clean up can be done like this
        return () => {
            clearInterval(priceInterval);
        }
    })

    if (!init) {
        chainlinkLatestAnswer(provider).then((price: BigNumber) => {
            if (!ethUsdPrice.eq(price)) {
                setEthUsdPrice(price.div(1e8))
            }
        }).catch((err) => console.error(err))
        if (!aprCalc.init) {
            aprCalc.initialize(provider).then(() => {
                console.log("APRCalculator initialized", aprCalc)
                handleUpdateValues()

            }).catch((e) => console.log("Error", e))
        } else {
            handleUpdateValues()
        }
        setInit(true)
    }

    function handleUpdateValues() {
        setTvl(aprCalc.tvl())
        setWethwETH(aprCalc.wethwInEth().toFixed(3))
        setWethsETH(aprCalc.wethsInEth().toFixed(3))
        setPhiETH(aprCalc.phiInEth())
        setPhisPHI(aprCalc.phisInEth().toFixed(3))
        setPhiwPHI(aprCalc.phiwInEth().toFixed(3))
        setLpsLp(aprCalc.lpsInLp().toFixed(3))
        setLpwLp(aprCalc.lpwInLp().toFixed(3))
        setLoading(false)
    }


    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <Countdown text={"Time To Merge"} endDate={expectedMergeDate}/>
            </div>
            <div className={styles.main}>
                {
                    loading ? <LoadingSpinner/> :
                        <>
                            <div className={styles.row}>
                                <Value label={"TVL"} value={tvl} token={weth} symbol={"Ξ"} updater={undefined}/>
                                <Value label={"TVL"} value={tvl.mul(ethUsdPrice)} token={weth} symbol={"$"}
                                       updater={undefined}/>
                            </div>
                            <div className={styles.row}>
                                <Value label={"WETHw"} value={wethwETH} token={undefined} symbol={"Ξ"}
                                       updater={undefined}/>
                                <Value label={"WETHs"} value={wethsETH} token={undefined} symbol={"Ξ"}
                                       updater={undefined}/>
                                <Value label={"LPw"} value={lpwLp} token={undefined} symbol={"LP"} updater={undefined}/>
                                <Value label={"LPs"} value={lpsLp} token={undefined} symbol={"LP"} updater={undefined}/>
                            </div>
                            <div className={styles.row}>
                                <Value label={"PHI"} value={(phiETH * ethUsdPrice.toNumber()).toFixed(2)}
                                       token={undefined}
                                       symbol={"$"} updater={undefined}/>
                                <Value label={"PHIw"} value={phiwPHI} token={undefined} symbol={"PHI"}
                                       updater={undefined}/>
                                <Value label={"PHIs"} value={phisPHI} token={undefined} symbol={"PHI"}
                                       updater={undefined}/>
                            </div>
                        </>
                }


            </div>
            <div className={styles.main}>
                <table id="farmTable" className={styles.styledTable}>
                    <tbody>
                    <tr className={styles.styledTableHeaderRow}>
                        <th>Name</th>
                        <th>APR (%)</th>
                        <th>TVL (Ξ)</th>
                    </tr>
                    {
                        staking.map((farm: any, i: number) => {
                            return (
                                <FarmRow key={i} farm={farm}/>
                            )
                        })
                    }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Home;
