
export default (
    <div className={"mt-12 text-center lg:text-left"}>
        <div className={"relative hero flex py-24 bg-gray-900"} style={{ backgroundImage: `url('/assets/about/FAQ.webp')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className={"container m-auto"}>
                <div className={"w-full grid grid-cols-3 gap-16"}>
                    <div className={"col-span-full lg:col-span-2"}>
                        <h1 className={"text-2xl sm:text-3xl lg:text-4xl xl:text-5xl uppercase text-orange-400"}>Frequently Asked Questions</h1>
                        <p className={"text-white text-lg font- pt-6"}>
                            Check out our most common questions that may help you.
                        </p>
                    </div>
                </div> 
            </div>
        </div>

        <div className={"min-h-screen bg-gray-775 py-10"}>
            <div className={"container"}>
                <div className={"grid grid-cols-1 gap-8"}>
                    <div>
                      <div className="font-semibold text-lg pb-2">How do I change my profile picture?</div>
                      Your profile picture is synced with the Single Sign On provider that you use (Facebook, Discord, Twitter,
                      etc). If you change your profile picture on the provider that your account is from, then logging out and
                      logging in of Keymash will refresh it.
                    </div>

                    <div>
                        <div className="font-semibold text-lg pb-2">Why is my Discord discriminator (#0000) not the same?</div>
                        We utilize a similar system to Discord including Snowflake UUID's and their discriminator. When you log in with Discord we apply our own discriminator that is not exclusive to Discord.
                    </div>

                    <div>
                        <div className="font-semibold text-lg pb-2">What parts of the game can you gain achievements and statistics?</div>
                        Public matches including "Dictionary" and "Quotes" in the Play menu and Ranked matches will give you statistics.
                        Tournaments and Custom matches do NOT count.
                    </div>

                    <div>
                        <div className="font-semibold text-lg pb-2">When do Guest accounts get removed?</div>
                        Guest accounts get removed every 7 days after their creation.
                    </div>

                    <div>
                        <div className="font-semibold text-lg pb-2">What does FKD system mean?</div>
                        FKD or <span className="font-semibold text-orange-400">"First Keystroke Delay"</span> is where we calculate the time it takes for the first keystroke to be typed and then subtract it 
                        from the overall time it takes to finish a match or round. We use this system to help eliminate the "latency" problem that is commonly 
                        found in typing games so that we can give the most accurate measurement of typing speed.
                    </div>

                    <div>
                        <div className="font-semibold text-lg pb-2">Why are Replay's not accessible in Match History</div>
                        As of right now our Replay system is in a beta stage where we are still currently working out its consistency and functionality. 
                        We do plan on making Replays a lot more accessible to recent Match History and will release information about it later on in 2022.
                    </div>
                </div>
            </div>
        </div>
    </div>
);