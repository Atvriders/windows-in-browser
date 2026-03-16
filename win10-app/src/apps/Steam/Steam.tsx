import { useState, useMemo } from 'react';
import './Steam.css';

interface Game {
  id: number;
  name: string;
  genre: string;
  size: string;
  lastPlayed: string;
  playtime: string;
  installed: boolean;
  status?: 'playing' | 'update' | 'downloading';
  rating?: string;
  year?: number;
}

// Top 500 Steam games (real titles)
const RAW_GAMES: [string, string, string, string, string, boolean, string?][] = [
  // [name, genre, size, lastPlayed, playtime, installed, status?]
  ['Counter-Strike 2','FPS','31.2 GB','Today','1,204 hrs',true,'playing'],
  ['Dota 2','MOBA','35.0 GB','Today','2,841 hrs',true],
  ['PUBG: Battlegrounds','Battle Royale','30.5 GB','Yesterday','342 hrs',true],
  ['Apex Legends','Battle Royale','75.4 GB','2 days ago','280 hrs',true],
  ['Cyberpunk 2077','RPG','70.4 GB','3 days ago','124 hrs',true],
  ['Elden Ring','Action RPG','60.0 GB','Last week','89 hrs',true],
  ['Baldur\'s Gate 3','RPG','122.3 GB','4 days ago','67 hrs',true,'update'],
  ['Red Dead Redemption 2','Action','150.0 GB','2 months ago','78 hrs',false],
  ['Minecraft','Sandbox','1.2 GB','Yesterday','512 hrs',true],
  ['Stardew Valley','Simulation','0.5 GB','Last week','210 hrs',true],
  ['Hollow Knight','Metroidvania','9.0 GB','2 weeks ago','55 hrs',true],
  ['The Witcher 3','RPG','50.0 GB','2 months ago','156 hrs',false],
  ['Hades','Roguelike','14.2 GB','Last week','93 hrs',true],
  ['Terraria','Sandbox','0.3 GB','Last month','420 hrs',true],
  ['Among Us','Party','0.3 GB','6 months ago','28 hrs',false],
  ['Hogwarts Legacy','Action RPG','85.1 GB','Last month','45 hrs',true],
  ['GTA V','Action','94.6 GB','Last month','203 hrs',false],
  ['Sea of Thieves','Adventure','50.0 GB','2 weeks ago','38 hrs',true],
  ['Valheim','Survival','1.8 GB','3 weeks ago','142 hrs',true],
  ['Deep Rock Galactic','Co-op','3.0 GB','Last week','88 hrs',true],
  ['Rust','Survival','25.0 GB','5 days ago','640 hrs',true],
  ['Ark: Survival Evolved','Survival','400.0 GB','3 months ago','88 hrs',false],
  ['Warframe','Action','35.0 GB','Last month','220 hrs',false],
  ['Path of Exile','ARPG','30.0 GB','2 months ago','310 hrs',false],
  ['Destiny 2','FPS','110.0 GB','Yesterday','480 hrs',true],
  ['Forza Horizon 5','Racing','110.0 GB','2 weeks ago','62 hrs',false],
  ['Dead by Daylight','Horror','34.0 GB','1 week ago','104 hrs',true],
  ['Phasmophobia','Horror','20.0 GB','2 weeks ago','56 hrs',true],
  ['Subnautica','Survival','14.0 GB','Last month','72 hrs',true],
  ['No Man\'s Sky','Survival','15.0 GB','3 months ago','44 hrs',false],
  ['Satisfactory','Simulation','8.0 GB','Last week','234 hrs',true],
  ['Factorio','Strategy','0.4 GB','2 weeks ago','680 hrs',true],
  ['Rocket League','Sports','22.0 GB','3 days ago','460 hrs',true],
  ['Fall Guys','Party','22.0 GB','1 month ago','82 hrs',true],
  ['Overcooked 2','Party','1.2 GB','2 months ago','34 hrs',false],
  ['It Takes Two','Co-op','15.0 GB','3 months ago','16 hrs',false],
  ['A Way Out','Co-op','22.0 GB','6 months ago','12 hrs',false],
  ['Celeste','Platformer','1.4 GB','1 month ago','38 hrs',true],
  ['Ori and the Will of the Wisps','Platformer','12.0 GB','2 months ago','22 hrs',true],
  ['Cuphead','Platformer','2.0 GB','3 months ago','18 hrs',true],
  ['Shovel Knight','Platformer','0.5 GB','4 months ago','24 hrs',false],
  ['Dead Cells','Roguelike','0.9 GB','1 month ago','60 hrs',true],
  ['Slay the Spire','Roguelike','0.8 GB','2 weeks ago','120 hrs',true],
  ['Into the Breach','Strategy','0.2 GB','1 month ago','44 hrs',false],
  ['FTL: Faster Than Light','Strategy','0.2 GB','2 months ago','88 hrs',false],
  ['Divinity: Original Sin 2','RPG','50.0 GB','Last month','112 hrs',false],
  ['Pillars of Eternity 2','RPG','25.0 GB','3 months ago','64 hrs',false],
  ['Tyranny','RPG','13.0 GB','4 months ago','34 hrs',false],
  ['Dark Souls III','Action RPG','18.0 GB','1 month ago','78 hrs',true],
  ['Dark Souls: Remastered','Action RPG','8.0 GB','2 months ago','44 hrs',false],
  ['Sekiro','Action RPG','12.0 GB','2 months ago','56 hrs',true],
  ['Nioh 2','Action RPG','50.0 GB','3 months ago','40 hrs',false],
  ['Monster Hunter: World','Action RPG','48.0 GB','2 months ago','190 hrs',true],
  ['Monster Hunter Rise','Action RPG','22.0 GB','1 month ago','82 hrs',true],
  ['Dragon\'s Dogma 2','Action RPG','60.0 GB','2 weeks ago','42 hrs',true],
  ['Resident Evil 2','Survival Horror','22.0 GB','Last month','28 hrs',true],
  ['Resident Evil 4','Survival Horror','67.0 GB','2 months ago','24 hrs',true],
  ['Resident Evil Village','Survival Horror','40.0 GB','3 months ago','22 hrs',false],
  ['Alan Wake 2','Horror','90.0 GB','1 month ago','18 hrs',true],
  ['Control','Action','50.0 GB','3 months ago','20 hrs',false],
  ['Prey','FPS','19.0 GB','4 months ago','34 hrs',false],
  ['Bioshock Infinite','FPS','30.0 GB','6 months ago','20 hrs',false],
  ['System Shock 2','FPS','2.0 GB','1 year ago','18 hrs',false],
  ['Disco Elysium','RPG','22.0 GB','2 months ago','40 hrs',true],
  ['Planescape Torment','RPG','2.0 GB','1 year ago','30 hrs',false],
  ['Wasteland 3','RPG','18.0 GB','4 months ago','28 hrs',false],
  ['Fallout 4','RPG','32.0 GB','5 months ago','180 hrs',false],
  ['Fallout: New Vegas','RPG','10.0 GB','6 months ago','220 hrs',false],
  ['Skyrim Special Edition','RPG','12.0 GB','1 month ago','340 hrs',false],
  ['Oblivion','RPG','7.0 GB','1 year ago','120 hrs',false],
  ['Mass Effect Legendary','RPG','120.0 GB','4 months ago','88 hrs',false],
  ['Dragon Age: Origins','RPG','15.0 GB','1 year ago','60 hrs',false],
  ['Dragon Age Inquisition','RPG','44.0 GB','6 months ago','88 hrs',false],
  ['Neverwinter Nights 2','RPG','10.0 GB','2 years ago','40 hrs',false],
  ['XCOM 2','Strategy','40.0 GB','3 months ago','120 hrs',true],
  ['Civilization VI','Strategy','28.0 GB','2 weeks ago','340 hrs',true],
  ['Stellaris','Strategy','10.0 GB','1 month ago','480 hrs',true],
  ['Hearts of Iron IV','Strategy','6.0 GB','2 months ago','220 hrs',true],
  ['Europa Universalis IV','Strategy','3.5 GB','3 months ago','340 hrs',false],
  ['Crusader Kings 3','Strategy','5.0 GB','1 month ago','280 hrs',true],
  ['Age of Empires IV','RTS','50.0 GB','2 weeks ago','120 hrs',true],
  ['StarCraft II','RTS','18.0 GB','1 month ago','440 hrs',false],
  ['Warcraft III Reforged','RTS','30.0 GB','3 months ago','60 hrs',false],
  ['Total War: Warhammer 3','Strategy','120.0 GB','1 month ago','210 hrs',true],
  ['Company of Heroes 3','RTS','35.0 GB','2 months ago','44 hrs',false],
  ['Halo Infinite','FPS','50.0 GB','1 week ago','88 hrs',true],
  ['Titanfall 2','FPS','48.0 GB','2 months ago','42 hrs',false],
  ['Doom Eternal','FPS','50.0 GB','2 months ago','34 hrs',true],
  ['Doom (2016)','FPS','44.0 GB','4 months ago','22 hrs',false],
  ['Wolfenstein II','FPS','40.0 GB','6 months ago','18 hrs',false],
  ['Quake','FPS','0.5 GB','8 months ago','12 hrs',false],
  ['Half-Life 2','FPS','7.0 GB','3 months ago','28 hrs',true],
  ['Half-Life: Alyx','VR FPS','67.0 GB','4 months ago','20 hrs',false],
  ['Portal 2','Puzzle','3.0 GB','2 months ago','20 hrs',true],
  ['Portal','Puzzle','0.8 GB','4 months ago','6 hrs',true],
  ['Outer Wilds','Adventure','4.0 GB','3 months ago','22 hrs',true],
  ['Return of the Obra Dinn','Puzzle','1.0 GB','4 months ago','10 hrs',false],
  ['Tunic','Action Adventure','2.0 GB','2 months ago','18 hrs',false],
  ['Inscryption','Roguelike','0.5 GB','3 months ago','20 hrs',false],
  ['Vampire Survivors','Roguelike','0.4 GB','1 week ago','120 hrs',true],
  ['Brotato','Roguelike','0.1 GB','2 weeks ago','44 hrs',true],
  ['20 Minutes Till Dawn','Roguelike','0.2 GB','1 month ago','28 hrs',false],
  ['Risk of Rain 2','Roguelike','1.0 GB','1 month ago','88 hrs',true],
  ['Binding of Isaac: Rebirth','Roguelike','0.2 GB','2 months ago','220 hrs',true],
  ['Gungeon: Enter the Gungeon','Roguelike','0.5 GB','3 months ago','60 hrs',false],
  ['Nuclear Throne','Roguelike','0.1 GB','4 months ago','28 hrs',false],
  ['Noita','Roguelike','0.3 GB','2 months ago','44 hrs',false],
  ['Spelunky 2','Platformer','0.6 GB','3 months ago','34 hrs',false],
  ['Neon Abyss','Roguelike','0.8 GB','4 months ago','22 hrs',false],
  ['Hades II','Roguelike','2.0 GB','1 week ago','28 hrs',true],
  ['Returnal','Roguelike','60.0 GB','1 month ago','34 hrs',false],
  ['The Forgotten City','RPG','5.0 GB','2 months ago','12 hrs',false],
  ['Pentiment','Adventure','6.0 GB','3 months ago','14 hrs',false],
  ['A Short Hike','Adventure','0.2 GB','2 months ago','4 hrs',false],
  ['Unpacking','Puzzle','0.8 GB','3 months ago','6 hrs',false],
  ['Hardspace: Shipbreaker','Simulation','7.0 GB','2 months ago','22 hrs',false],
  ['PowerWash Simulator','Simulation','2.0 GB','1 month ago','28 hrs',true],
  ['Cities: Skylines','Simulation','6.0 GB','2 months ago','480 hrs',true],
  ['Planet Coaster','Simulation','16.0 GB','3 months ago','88 hrs',false],
  ['Two Point Hospital','Simulation','6.0 GB','4 months ago','44 hrs',false],
  ['Prison Architect','Simulation','0.7 GB','6 months ago','120 hrs',false],
  ['Dwarf Fortress','Simulation','0.3 GB','1 month ago','180 hrs',false],
  ['RimWorld','Simulation','0.3 GB','2 weeks ago','600 hrs',true],
  ['Oxygen Not Included','Simulation','0.8 GB','1 month ago','380 hrs',true],
  ['Surviving Mars','Simulation','4.0 GB','3 months ago','44 hrs',false],
  ['Terra Nil','Simulation','0.5 GB','2 months ago','10 hrs',false],
  ['Timberborn','Simulation','1.0 GB','1 month ago','44 hrs',false],
  ['Parkitect','Simulation','2.0 GB','3 months ago','120 hrs',false],
  ['OpenTTD','Simulation','0.1 GB','2 months ago','80 hrs',false],
  ['Mini Metro','Casual','0.1 GB','3 months ago','22 hrs',false],
  ['Islanders','Casual','0.1 GB','2 months ago','18 hrs',false],
  ['Townscaper','Casual','0.1 GB','3 months ago','8 hrs',false],
  ['Dorfromantik','Casual','0.2 GB','1 month ago','22 hrs',false],
  ['Loop Hero','Roguelike','0.3 GB','2 months ago','28 hrs',false],
  ['Luck be a Landlord','Roguelike','0.2 GB','1 month ago','18 hrs',false],
  ['Balatro','Card Game','0.1 GB','1 week ago','60 hrs',true],
  ['Shotgun King','Strategy','0.1 GB','2 months ago','10 hrs',false],
  ['Peglin','Roguelike','0.3 GB','1 month ago','22 hrs',false],
  ['Roguebook','Roguelike','0.5 GB','3 months ago','18 hrs',false],
  ['Monster Train','Card Game','1.0 GB','2 months ago','44 hrs',false],
  ['Midnight Suns','Strategy','20.0 GB','1 month ago','34 hrs',false],
  ['Griftlands','Roguelike','0.5 GB','3 months ago','28 hrs',false],
  ['Cobalt Core','Roguelike','0.3 GB','1 month ago','18 hrs',false],
  ['Star Realms','Card Game','0.1 GB','4 months ago','8 hrs',false],
  ['PAYDAY 3','FPS','24.0 GB','1 month ago','34 hrs',true],
  ['PAYDAY 2','FPS','16.0 GB','6 months ago','280 hrs',false],
  ['Back 4 Blood','FPS','37.0 GB','2 months ago','44 hrs',false],
  ['Left 4 Dead 2','FPS','13.0 GB','3 months ago','220 hrs',false],
  ['World War Z','FPS','15.0 GB','4 months ago','28 hrs',false],
  ['Aliens: Fireteam Elite','FPS','20.0 GB','3 months ago','22 hrs',false],
  ['Vermintide 2','FPS','40.0 GB','2 months ago','88 hrs',false],
  ['Darktide','FPS','44.0 GB','1 month ago','44 hrs',true],
  ['Space Marine 2','FPS','75.0 GB','2 weeks ago','28 hrs',true],
  ['Helldivers 2','TPS','40.0 GB','3 days ago','120 hrs',true],
  ['The Finals','FPS','30.0 GB','1 week ago','44 hrs',true],
  ['XDefiant','FPS','25.0 GB','2 weeks ago','22 hrs',false],
  ['Delta Force','FPS','60.0 GB','1 month ago','18 hrs',false],
  ['Battlefield 2042','FPS','100.0 GB','2 months ago','44 hrs',false],
  ['Battlefield V','FPS','100.0 GB','3 months ago','88 hrs',false],
  ['Battlefield 1','FPS','66.0 GB','4 months ago','120 hrs',false],
  ['Battlefield 4','FPS','50.0 GB','6 months ago','180 hrs',false],
  ['Squad','FPS','12.0 GB','2 months ago','44 hrs',false],
  ['Arma 3','FPS','42.0 GB','3 months ago','120 hrs',false],
  ['DayZ','Survival','20.0 GB','2 months ago','88 hrs',false],
  ['Hunt: Showdown','FPS','29.0 GB','1 week ago','120 hrs',true],
  ['Escape from Tarkov','FPS','40.0 GB','2 weeks ago','220 hrs',true],
  ['Gray Zone Warfare','FPS','50.0 GB','1 month ago','34 hrs',false],
  ['The Division 2','TPS','88.0 GB','3 months ago','44 hrs',false],
  ['Outriders','TPS','40.0 GB','4 months ago','22 hrs',false],
  ['Remnant 2','Action RPG','40.0 GB','1 month ago','34 hrs',true],
  ['Remnant: From the Ashes','Action RPG','25.0 GB','2 months ago','44 hrs',false],
  ['Code Vein','Action RPG','17.0 GB','3 months ago','34 hrs',false],
  ['Star Wars Jedi: Survivor','Action','155.0 GB','1 month ago','28 hrs',true,'update'],
  ['Star Wars Jedi: Fallen Order','Action','48.0 GB','3 months ago','24 hrs',false],
  ['God of War','Action','33.8 GB','2 months ago','34 hrs',true],
  ['Spider-Man Remastered','Action','75.0 GB','1 month ago','28 hrs',true],
  ['Spider-Man: Miles Morales','Action','75.0 GB','2 months ago','14 hrs',false],
  ['Ratchet & Clank: Rift Apart','Action','40.0 GB','3 months ago','16 hrs',false],
  ['Ghost of Tsushima','Action','60.0 GB','1 month ago','44 hrs',true],
  ['Horizon Zero Dawn','Action RPG','67.0 GB','2 months ago','60 hrs',false],
  ['Death Stranding','Action','80.0 GB','3 months ago','34 hrs',false],
  ['NieR:Automata','Action RPG','22.0 GB','2 months ago','44 hrs',true],
  ['Yakuza 0','Action RPG','26.0 GB','3 months ago','44 hrs',false],
  ['Like a Dragon: Ishin!','Action RPG','44.0 GB','2 months ago','34 hrs',false],
  ['Like a Dragon: Infinite Wealth','Action RPG','54.0 GB','1 month ago','28 hrs',true],
  ['Persona 5 Royal','RPG','21.0 GB','2 months ago','88 hrs',true],
  ['Persona 4 Golden','RPG','14.0 GB','3 months ago','60 hrs',false],
  ['Persona 3 Reload','RPG','24.0 GB','1 month ago','44 hrs',true],
  ['Final Fantasy XIV','MMORPG','88.0 GB','1 week ago','480 hrs',true],
  ['Final Fantasy XVI','RPG','100.0 GB','1 month ago','34 hrs',false],
  ['Final Fantasy VII Rebirth','RPG','150.0 GB','2 weeks ago','28 hrs',true],
  ['Final Fantasy VII Remake','RPG','84.0 GB','1 month ago','44 hrs',true],
  ['Dragon Quest XI','RPG','33.0 GB','3 months ago','88 hrs',false],
  ['Tales of Arise','RPG','36.0 GB','3 months ago','44 hrs',false],
  ['Scarlet Nexus','Action RPG','14.0 GB','4 months ago','22 hrs',false],
  ['Blue Protocol','MMORPG','25.0 GB','2 months ago','28 hrs',false],
  ['Lost Ark','MMORPG','100.0 GB','2 months ago','120 hrs',false],
  ['Black Desert Online','MMORPG','70.0 GB','3 months ago','44 hrs',false],
  ['World of Warcraft','MMORPG','90.0 GB','1 month ago','1,200 hrs',false],
  ['Guild Wars 2','MMORPG','85.0 GB','3 months ago','120 hrs',false],
  ['Star Trek Online','MMORPG','20.0 GB','6 months ago','44 hrs',false],
  ['Elder Scrolls Online','MMORPG','90.0 GB','2 months ago','88 hrs',false],
  ['New World: Aeternum','MMORPG','65.0 GB','1 month ago','28 hrs',false],
  ['V Rising','Survival','2.0 GB','2 weeks ago','88 hrs',true],
  ['Project Zomboid','Survival','2.5 GB','1 month ago','120 hrs',true],
  ['The Long Dark','Survival','4.0 GB','2 months ago','44 hrs',false],
  ['Green Hell','Survival','12.0 GB','3 months ago','28 hrs',false],
  ['The Forest','Survival','4.5 GB','4 months ago','34 hrs',false],
  ['Sons of the Forest','Survival','15.0 GB','2 months ago','22 hrs',false],
  ['Grounded','Survival','8.0 GB','1 month ago','44 hrs',true],
  ['Stranded Deep','Survival','2.0 GB','3 months ago','18 hrs',false],
  ['Raft','Survival','3.0 GB','2 months ago','34 hrs',false],
  ['Subnautica: Below Zero','Survival','8.0 GB','3 months ago','22 hrs',false],
  ['Astroneer','Exploration','7.0 GB','2 months ago','44 hrs',false],
  ['Planet Crafter','Simulation','1.0 GB','1 month ago','28 hrs',true],
  ['Lightyear Frontier','Survival','3.0 GB','2 weeks ago','18 hrs',true],
  ['Enshrouded','Survival','8.0 GB','1 month ago','34 hrs',true],
  ['Palworld','Survival','8.0 GB','2 months ago','120 hrs',true],
  ['Nightingale','Survival','35.0 GB','2 months ago','18 hrs',false],
  ['Soulmask','Survival','8.0 GB','1 month ago','22 hrs',false],
  ['Frostpunk 2','Strategy','14.0 GB','2 weeks ago','44 hrs',true],
  ['Anno 1800','Simulation','12.0 GB','1 month ago','120 hrs',true],
  ['Tropico 6','Simulation','8.0 GB','2 months ago','44 hrs',false],
  ['They Are Billions','Strategy','2.0 GB','3 months ago','44 hrs',false],
  ['Age of Darkness: Final Stand','Strategy','3.0 GB','2 months ago','28 hrs',false],
  ['Warcraft Rumble','Strategy','4.0 GB','1 month ago','22 hrs',false],
  ['Northgard','Strategy','1.0 GB','2 months ago','88 hrs',false],
  ['Humankind','Strategy','10.0 GB','3 months ago','44 hrs',false],
  ['Old World','Strategy','1.5 GB','2 months ago','44 hrs',false],
  ['Songs of Conquest','Strategy','2.0 GB','1 month ago','44 hrs',false],
  ['Heroes of Might and Magic III','Strategy','1.0 GB','6 months ago','120 hrs',false],
  ['Victoria 3','Strategy','5.0 GB','2 months ago','88 hrs',false],
  ['Imperator: Rome','Strategy','3.0 GB','3 months ago','44 hrs',false],
  ['Warhammer 40K: Rogue Trader','RPG','30.0 GB','1 month ago','44 hrs',true],
  ['Owlcat: Pathfinder WotR','RPG','23.0 GB','2 months ago','88 hrs',false],
  ['Solasta','RPG','14.0 GB','3 months ago','44 hrs',false],
  ['Neverwinter Nights EE','RPG','6.0 GB','6 months ago','22 hrs',false],
  ['Gloomhaven','Strategy','5.0 GB','2 months ago','44 hrs',false],
  ['Talisman','Board Game','1.5 GB','3 months ago','18 hrs',false],
  ['Tabletop Simulator','Simulation','0.5 GB','1 month ago','44 hrs',true],
  ['Chess Ultra','Board Game','0.8 GB','3 months ago','18 hrs',false],
  ['Lichess','Board Game','0.1 GB','1 month ago','44 hrs',false],
  ['Rocket Arena','Shooter','15.0 GB','4 months ago','12 hrs',false],
  ['Knockout City','Sports','9.0 GB','6 months ago','22 hrs',false],
  ['Windjammers 2','Sports','2.0 GB','3 months ago','14 hrs',false],
  ['Nidhogg 2','Fighting','1.0 GB','4 months ago','8 hrs',false],
  ['Sifu','Fighting','15.0 GB','2 months ago','22 hrs',true],
  ['Tekken 8','Fighting','100.0 GB','1 month ago','28 hrs',true],
  ['Street Fighter 6','Fighting','45.0 GB','2 months ago','34 hrs',false],
  ['Mortal Kombat 1','Fighting','80.0 GB','1 month ago','22 hrs',false],
  ['Guilty Gear Strive','Fighting','18.0 GB','2 months ago','34 hrs',false],
  ['Melty Blood','Fighting','5.0 GB','3 months ago','22 hrs',false],
  ['Dragon Ball FighterZ','Fighting','18.0 GB','4 months ago','44 hrs',false],
  ['King of Fighters XV','Fighting','18.0 GB','3 months ago','18 hrs',false],
  ['Skullgirls','Fighting','3.0 GB','4 months ago','22 hrs',false],
  ['Rivals of Aether 2','Fighting','3.0 GB','1 month ago','18 hrs',false],
  ['Brawlhalla','Fighting','1.5 GB','2 months ago','44 hrs',false],
  ['MultiVersus','Fighting','15.0 GB','3 months ago','18 hrs',false],
  ['Fall Guys: Ultimate Knockout','Party','22.0 GB','1 month ago','82 hrs',false],
  ['Stumble Guys','Party','0.5 GB','2 months ago','28 hrs',false],
  ['Gang Beasts','Party','3.5 GB','3 months ago','18 hrs',false],
  ['Human Fall Flat','Party','1.2 GB','2 months ago','28 hrs',false],
  ['Moving Out','Party','1.5 GB','3 months ago','14 hrs',false],
  ['Moving Out 2','Party','2.5 GB','2 months ago','10 hrs',false],
  ['Pummel Party','Party','2.0 GB','1 month ago','22 hrs',false],
  ['PlateUp!','Party','1.0 GB','2 months ago','28 hrs',false],
  ['Crab Game','Party','0.2 GB','3 months ago','18 hrs',false],
  ['The Ship','Party','1.5 GB','1 year ago','8 hrs',false],
  ['SpeedRunners','Party','0.8 GB','4 months ago','28 hrs',false],
  ['Neon White','Action','1.5 GB','2 months ago','14 hrs',false],
  ['Hi-Fi Rush','Action','20.0 GB','1 month ago','18 hrs',true],
  ['Ghostrunner 2','Action','16.0 GB','2 months ago','14 hrs',false],
  ['Katana ZERO','Action','0.4 GB','3 months ago','6 hrs',false],
  ['Hotline Miami 2','Action','0.8 GB','4 months ago','10 hrs',false],
  ['My Friend Pedro','Action','2.5 GB','3 months ago','8 hrs',false],
  ['Ultrakill','FPS','1.5 GB','2 months ago','44 hrs',true],
  ['Prodeus','FPS','0.5 GB','3 months ago','12 hrs',false],
  ['Ion Fury','FPS','0.5 GB','4 months ago','10 hrs',false],
  ['Dusk','FPS','0.3 GB','3 months ago','10 hrs',false],
  ['Dread Templar','FPS','0.3 GB','4 months ago','8 hrs',false],
  ['Wrath: Aeon of Ruin','FPS','0.4 GB','5 months ago','12 hrs',false],
  ['Amid Evil','FPS','4.0 GB','4 months ago','10 hrs',false],
  ['Turbo Overkill','FPS','1.0 GB','3 months ago','12 hrs',false],
  ['Butcher','Action','0.3 GB','6 months ago','6 hrs',false],
  ['Huntdown','Action','0.5 GB','5 months ago','8 hrs',false],
  ['Ruiner','Action','5.0 GB','4 months ago','10 hrs',false],
  ['Fallen Aces','Action','1.0 GB','3 months ago','6 hrs',false],
  ['Signalis','Survival Horror','0.5 GB','2 months ago','10 hrs',true],
  ['Dredge','Adventure','0.5 GB','3 months ago','12 hrs',false],
  ['Stray','Adventure','8.0 GB','2 months ago','8 hrs',true],
  ['Little Kitty Big City','Adventure','2.0 GB','1 month ago','6 hrs',false],
  ['Venba','Adventure','0.4 GB','2 months ago','4 hrs',false],
  ['Chants of Sennaar','Puzzle','0.5 GB','3 months ago','10 hrs',false],
  ['Patrick\'s Parabox','Puzzle','0.5 GB','2 months ago','18 hrs',false],
  ['The Witness','Puzzle','3.0 GB','4 months ago','28 hrs',false],
  ['Manifold Garden','Puzzle','1.5 GB','3 months ago','8 hrs',false],
  ['Cocoon','Puzzle','1.5 GB','2 months ago','8 hrs',false],
  ['Animal Well','Puzzle','0.3 GB','1 month ago','14 hrs',true],
  ['Myst','Puzzle','2.5 GB','6 months ago','8 hrs',false],
  ['Obduction','Puzzle','8.0 GB','4 months ago','10 hrs',false],
  ['The Room','Puzzle','0.5 GB','3 months ago','4 hrs',false],
  ['Antichamber','Puzzle','0.4 GB','6 months ago','8 hrs',false],
  ['Superliminal','Puzzle','3.0 GB','3 months ago','4 hrs',false],
  ['Relicta','Puzzle','4.0 GB','4 months ago','8 hrs',false],
  ['The Talos Principle 2','Puzzle','14.0 GB','2 months ago','18 hrs',true],
  ['Observation','Adventure','8.0 GB','3 months ago','6 hrs',false],
  ['In Other Waters','Adventure','0.2 GB','4 months ago','8 hrs',false],
  ['Heaven\'s Vault','Adventure','3.5 GB','3 months ago','10 hrs',false],
  ['Weird West','Action RPG','14.0 GB','2 months ago','22 hrs',false],
  ['The Pathless','Action','8.0 GB','3 months ago','8 hrs',false],
  ['Kena: Bridge of Spirits','Action','16.0 GB','2 months ago','10 hrs',true],
  ['Scorn','Horror','14.0 GB','3 months ago','8 hrs',false],
  ['Visage','Horror','8.0 GB','3 months ago','10 hrs',false],
  ['Amnesia: Rebirth','Horror','14.0 GB','4 months ago','8 hrs',false],
  ['Outlast','Horror','8.0 GB','6 months ago','6 hrs',false],
  ['SOMA','Horror','14.0 GB','4 months ago','10 hrs',false],
  ['Little Nightmares II','Horror','5.0 GB','3 months ago','6 hrs',false],
  ['Layers of Fear','Horror','8.0 GB','4 months ago','6 hrs',false],
  ['The Mortuary Assistant','Horror','4.0 GB','2 months ago','10 hrs',false],
  ['Doki Doki Literature Club','Visual Novel','0.2 GB','6 months ago','6 hrs',false],
  ['Higurashi When They Cry','Visual Novel','1.5 GB','4 months ago','28 hrs',false],
  ['Steins;Gate','Visual Novel','3.0 GB','3 months ago','22 hrs',false],
  ['Clannad','Visual Novel','2.0 GB','6 months ago','28 hrs',false],
  ['VA-11 Hall-A','Visual Novel','0.5 GB','4 months ago','10 hrs',false],
  ['Coffee Talk','Visual Novel','0.5 GB','3 months ago','8 hrs',false],
  ['Night in the Woods','Adventure','2.5 GB','3 months ago','8 hrs',false],
  ['Oxenfree','Adventure','2.0 GB','4 months ago','6 hrs',false],
  ['Oxenfree II','Adventure','4.0 GB','3 months ago','8 hrs',false],
  ['Gone Home','Adventure','2.5 GB','6 months ago','4 hrs',false],
  ['Firewatch','Adventure','7.0 GB','4 months ago','6 hrs',false],
  ['Edith Finch','Adventure','3.5 GB','3 months ago','2 hrs',false],
  ['Kentucky Route Zero','Adventure','4.0 GB','6 months ago','12 hrs',false],
  ['Norco','Adventure','0.5 GB','3 months ago','6 hrs',false],
  ['Roadwarden','RPG','0.2 GB','2 months ago','10 hrs',false],
  ['Citizen Sleeper','RPG','0.5 GB','3 months ago','12 hrs',false],
  ['Mutazione','Adventure','0.5 GB','4 months ago','8 hrs',false],
  ['Overcooked! All You Can Eat','Party','4.0 GB','2 months ago','18 hrs',false],
  ['KeyWe','Party','2.0 GB','3 months ago','6 hrs',false],
  ['Frog Detective','Adventure','0.2 GB','4 months ago','2 hrs',false],
  ['Later Daters','Visual Novel','0.2 GB','6 months ago','4 hrs',false],
  ['Bugsnax','Adventure','1.5 GB','3 months ago','8 hrs',false],
  ['Costume Quest','RPG','1.5 GB','6 months ago','6 hrs',false],
  ['Psychonauts 2','Platformer','23.0 GB','3 months ago','12 hrs',false],
  ['Yooka-Laylee','Platformer','6.0 GB','4 months ago','10 hrs',false],
  ['A Hat in Time','Platformer','4.5 GB','3 months ago','18 hrs',true],
  ['Banjo-Kazooie: N&B','Platformer','6.0 GB','6 months ago','14 hrs',false],
  ['Crash Bandicoot N. Sane','Platformer','15.0 GB','4 months ago','12 hrs',false],
  ['Spyro Reignited','Platformer','30.0 GB','3 months ago','14 hrs',false],
  ['Sonic Frontiers','Platformer','15.0 GB','2 months ago','18 hrs',false],
  ['Sonic Colors Ultimate','Platformer','5.0 GB','3 months ago','8 hrs',false],
  ['Kirby and the Forgotten Land','Platformer','5.0 GB','2 months ago','10 hrs',false],
  ['Super Mario Odyssey','Platformer','5.7 GB','1 month ago','22 hrs',false],
  ['Rayman Legends','Platformer','10.0 GB','4 months ago','14 hrs',false],
  ['Shantae and the Seven Sirens','Platformer','3.0 GB','3 months ago','12 hrs',false],
  ['Shovel Knight: Treasure Trove','Platformer','0.5 GB','2 months ago','28 hrs',false],
  ['Freedom Planet 2','Platformer','2.5 GB','3 months ago','14 hrs',false],
  ['Bloodstained: Ritual of the Night','Metroidvania','14.5 GB','2 months ago','28 hrs',false],
  ['Axiom Verge 2','Metroidvania','1.0 GB','3 months ago','14 hrs',false],
  ['Metroid Dread','Metroidvania','6.0 GB','2 months ago','12 hrs',false],
  ['Momodora: Moonlit Farewell','Metroidvania','1.0 GB','1 month ago','8 hrs',true],
  ['Nine Sols','Metroidvania','1.5 GB','2 weeks ago','22 hrs',true],
  ['Islets','Metroidvania','0.5 GB','2 months ago','10 hrs',false],
  ['Ender Lilies','Metroidvania','2.0 GB','3 months ago','14 hrs',false],
  ['Haiku the Robot','Metroidvania','0.3 GB','2 months ago','10 hrs',false],
  ['Rogue Legacy 2','Roguelike','1.5 GB','1 month ago','44 hrs',true],
  ['Skul: The Hero Slayer','Roguelike','0.4 GB','2 months ago','28 hrs',false],
  ['Curse of the Dead Gods','Roguelike','1.0 GB','3 months ago','22 hrs',false],
  ['Hades (Original)','Roguelike','14.0 GB','1 month ago','93 hrs',false],
  ['Ravenswatch','Roguelike','1.0 GB','2 months ago','18 hrs',false],
  ['Crown Trick','Roguelike','0.3 GB','3 months ago','10 hrs',false],
  ['Wildfrost','Roguelike','0.5 GB','2 months ago','18 hrs',false],
  ['Backpack Hero','Roguelike','0.2 GB','1 month ago','14 hrs',false],
  ['Dicefolk','Roguelike','0.2 GB','2 months ago','10 hrs',false],
  ['Dungeons of Dreadrock','Puzzle','0.2 GB','3 months ago','6 hrs',false],
  ['Diablo IV','ARPG','90.0 GB','2 weeks ago','88 hrs',true],
  ['Diablo III','ARPG','30.0 GB','1 month ago','220 hrs',false],
  ['Torchlight Infinite','ARPG','4.0 GB','2 months ago','44 hrs',false],
  ['Last Epoch','ARPG','12.0 GB','1 month ago','88 hrs',true],
  ['Wolcen','ARPG','9.0 GB','4 months ago','18 hrs',false],
  ['Grim Dawn','ARPG','4.5 GB','2 months ago','120 hrs',false],
  ['Victor Vran','ARPG','5.0 GB','4 months ago','18 hrs',false],
  ['Sacred 2','ARPG','14.0 GB','1 year ago','44 hrs',false],
  ['Titan Quest','ARPG','8.0 GB','6 months ago','44 hrs',false],
  ['Dungeon Siege III','ARPG','6.0 GB','1 year ago','18 hrs',false],
  ['Fortnite','Battle Royale','30.0 GB','1 week ago','320 hrs',true],
  ['Warzone 2.0','Battle Royale','100.0 GB','2 weeks ago','88 hrs',false],
  ['Hyper Scape','Battle Royale','25.0 GB','1 year ago','8 hrs',false],
  ['Super People','Battle Royale','15.0 GB','6 months ago','22 hrs',false],
  ['Naraka: Bladepoint','Battle Royale','30.0 GB','2 months ago','28 hrs',false],
  ['Ring of Elysium','Battle Royale','8.0 GB','6 months ago','14 hrs',false],
  ['Cuisine Royale','Battle Royale','5.0 GB','8 months ago','8 hrs',false],
];

const STORE_FEATURED = [
  { id: 101, name: 'Starfield', icon: '🌌', price: '$69.99', discount: null, genre: 'RPG' },
  { id: 102, name: 'Alan Wake 2', icon: '🔦', price: '$59.99', discount: '-20%', genre: 'Horror' },
  { id: 103, name: 'Lies of P', icon: '🎭', price: '$49.99', discount: '-25%', genre: 'Souls-like' },
  { id: 104, name: 'Forza Horizon 5', icon: '🏎️', price: '$59.99', discount: '-33%', genre: 'Racing' },
  { id: 105, name: 'Sea of Stars', icon: '⭐', price: '$34.99', discount: null, genre: 'RPG' },
  { id: 106, name: 'Dave the Diver', icon: '🤿', price: '$19.99', discount: '-15%', genre: 'Adventure' },
  { id: 107, name: 'Prince of Persia: Lost Crown', icon: '👑', price: '$39.99', discount: '-10%', genre: 'Metroidvania' },
  { id: 108, name: 'Granblue Fantasy: Relink', icon: '⚔️', price: '$59.99', discount: null, genre: 'Action RPG' },
];

const ICONS: Record<string, string> = {
  FPS:'🎯', MOBA:'🏆', 'Battle Royale':'🪂', RPG:'📖', 'Action RPG':'⚔️', Action:'🗡️',
  Sandbox:'⛏️', Survival:'🏕️', Strategy:'♟️', Simulation:'🏗️', Roguelike:'🎲',
  Party:'🎉', Puzzle:'🧩', Platformer:'🕹️', Metroidvania:'🦋', Fighting:'🥊',
  Horror:'👻', ARPG:'⚡', Adventure:'🗺️', 'Card Game':'🃏', RTS:'🏰',
  MMORPG:'🌍', Racing:'🏎️', Sports:'⚽', TPS:'🔫', 'Visual Novel':'📖', Casual:'😊',
};

type Tab = 'store' | 'library' | 'community' | 'profile';
type SortKey = 'name' | 'playtime' | 'lastPlayed' | 'size';

const LIBRARY: Game[] = RAW_GAMES.map(([name, genre, size, lastPlayed, playtime, installed, status], i) => ({
  id: i + 1, name, genre, size, lastPlayed, playtime, installed, status: status as any,
}));

export default function Steam() {
  const [tab, setTab] = useState<Tab>('library');
  const [selected, setSelected] = useState<Game>(LIBRARY[0]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return LIBRARY
      .filter(g => g.name.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'playtime') return parseInt(b.playtime.replace(/,/g,'')) - parseInt(a.playtime.replace(/,/g,''));
        return 0;
      });
  }, [search, sortBy]);

  const installed = filtered.filter(g => g.installed);
  const notInstalled = filtered.filter(g => !g.installed);
  const visibleNotInstalled = showAll ? notInstalled : notInstalled.slice(0, 30);

  return (
    <div className="steam">
      <div className="steam-titlebar">
        <span className="steam-logo">STEAM</span>
        <nav className="steam-nav">
          {(['store','library','community','profile'] as Tab[]).map(t => (
            <button key={t} className={`steam-nav-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
        <div className="steam-nav-right">
          <span className="steam-username">👤 User</span>
          <span className="steam-balance">$24.50</span>
        </div>
      </div>

      {tab === 'library' && (
        <div className="steam-library">
          <div className="steam-sidebar">
            <input className="steam-search" placeholder="🔍 Search games..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="steam-sort" value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} style={{ margin: '4px 8px', padding: '4px', fontSize: 12, background: '#1e2837', color: '#c6d4df', border: '1px solid #4a5568', borderRadius: 3 }}>
              <option value="name">Sort: Name</option>
              <option value="playtime">Sort: Playtime</option>
            </select>

            <div className="steam-list-header">INSTALLED ({installed.length})</div>
            {installed.map(g => (
              <button key={g.id} className={`steam-game-item ${selected?.id === g.id ? 'active' : ''}`} onClick={() => setSelected(g)}>
                <span className="steam-game-icon">{ICONS[g.genre] ?? '🎮'}</span>
                <div className="steam-game-info">
                  <span className="steam-game-name">{g.name}</span>
                  {g.status === 'playing' && <span className="steam-badge playing">Playing</span>}
                  {g.status === 'update' && <span className="steam-badge update">Update</span>}
                  {g.status === 'downloading' && <span className="steam-badge update">↓</span>}
                </div>
              </button>
            ))}
            {notInstalled.length > 0 && (
              <>
                <div className="steam-list-header">NOT INSTALLED ({notInstalled.length})</div>
                {visibleNotInstalled.map(g => (
                  <button key={g.id} className={`steam-game-item not-installed ${selected?.id === g.id ? 'active' : ''}`} onClick={() => setSelected(g)}>
                    <span className="steam-game-icon">{ICONS[g.genre] ?? '🎮'}</span>
                    <span className="steam-game-name">{g.name}</span>
                  </button>
                ))}
                {!showAll && notInstalled.length > 30 && (
                  <button className="steam-game-item" style={{ color: '#66c0f4', justifyContent: 'center' }} onClick={() => setShowAll(true)}>
                    Show all {notInstalled.length} games…
                  </button>
                )}
              </>
            )}
          </div>

          <div className="steam-detail">
            {selected ? (
              <>
                <div className="steam-hero" style={{ background: `linear-gradient(135deg, #1a2a4a 0%, #0e1621 100%)` }}>
                  <div className="steam-hero-icon">{ICONS[selected.genre] ?? '🎮'}</div>
                  <div className="steam-hero-info">
                    <h2 className="steam-hero-title">{selected.name}</h2>
                    <div className="steam-hero-meta">
                      <span>{selected.genre}</span>
                      <span>·</span>
                      <span>{selected.playtime} on record</span>
                    </div>
                  </div>
                </div>
                <div className="steam-detail-body">
                  <div className="steam-detail-actions">
                    {selected.installed ? (
                      <>
                        <button className="steam-play-btn">▶ Play</button>
                        {selected.status === 'update' && <button className="steam-update-btn">⬇ Update</button>}
                        <button className="steam-action-btn">📊 Stats</button>
                        <button className="steam-action-btn">🏆 Achievements</button>
                        <button className="steam-action-btn">⚙ Properties</button>
                      </>
                    ) : (
                      <button className="steam-install-btn">⬇ Install</button>
                    )}
                  </div>
                  <div className="steam-detail-stats">
                    <div className="steam-stat"><span>Last played</span><b>{selected.lastPlayed}</b></div>
                    <div className="steam-stat"><span>Playtime</span><b>{selected.playtime}</b></div>
                    <div className="steam-stat"><span>Disk space</span><b>{selected.size}</b></div>
                    <div className="steam-stat"><span>Genre</span><b>{selected.genre}</b></div>
                    <div className="steam-stat"><span>Status</span><b style={{ color: selected.installed ? '#6bcb77' : '#aaa' }}>{selected.installed ? 'Installed' : 'Not installed'}</b></div>
                  </div>
                  <div className="steam-friends-activity">
                    <div className="steam-section-title">Friends Activity</div>
                    <div className="steam-friend-row">
                      <span>🟢 Alex_G</span><span>playing {selected.name}</span><span>2 hrs</span>
                    </div>
                    <div className="steam-friend-row">
                      <span>🟢 KingSlayer99</span><span>playing {selected.name}</span><span>45 min</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="steam-empty">Select a game from your library</div>
            )}
          </div>
        </div>
      )}

      {tab === 'store' && (
        <div className="steam-store">
          <div className="steam-store-banner">
            <div className="steam-banner-text">
              <h2>Weekend Deal</h2>
              <p>Up to 75% off on top titles</p>
              <button className="steam-play-btn">Browse Sales</button>
            </div>
          </div>
          <div className="steam-store-section">
            <div className="steam-section-title">Featured &amp; Recommended</div>
            <div className="steam-store-grid">
              {STORE_FEATURED.map(g => (
                <div key={g.id} className="steam-store-card">
                  <div className="steam-store-card-art">{g.icon}</div>
                  <div className="steam-store-card-info">
                    <div className="steam-store-card-name">{g.name}</div>
                    <div className="steam-store-card-genre">{g.genre}</div>
                    <div className="steam-store-card-price">
                      {g.discount && <span className="steam-discount">{g.discount}</span>}
                      <span className="steam-price">{g.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'community' && (
        <div className="steam-community">
          <div className="steam-section-title" style={{ padding: '16px' }}>Community Hub</div>
          <div className="steam-community-stats">
            <div className="steam-comm-stat"><b>2,847</b><span>Friends Online</span></div>
            <div className="steam-comm-stat"><b>142M</b><span>Players Online</span></div>
            <div className="steam-comm-stat"><b>50,000+</b><span>Games Available</span></div>
          </div>
          <div style={{ padding: '16px' }}>
            {['Activity Feed','Discussions','Screenshots','Workshop','Market'].map(s => (
              <div key={s} className="steam-community-item">🔗 {s}</div>
            ))}
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="steam-profile">
          <div className="steam-profile-hero">
            <div className="steam-avatar">👤</div>
            <div>
              <div className="steam-profile-name">User</div>
              <div className="steam-profile-level">Level 42 · Steam Member since 2018</div>
              <div className="steam-online-status">🟢 Online</div>
            </div>
          </div>
          <div className="steam-profile-stats">
            <div className="steam-pstat"><b>{LIBRARY.length}</b><span>Games</span></div>
            <div className="steam-pstat"><b>847</b><span>Achievements</span></div>
            <div className="steam-pstat"><b>$24.50</b><span>Wallet</span></div>
            <div className="steam-pstat"><b>48</b><span>Friends</span></div>
          </div>
        </div>
      )}

      <div className="steam-statusbar">
        <span>🟢 Steam Online</span>
        <span>{LIBRARY.filter(g => g.installed).length} games installed · {LIBRARY.length} total</span>
        <span>▼ 0 KB/s</span>
      </div>
    </div>
  );
}
