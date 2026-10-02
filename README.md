# RED SEA READY – frontend

Offentlig, responsiv studieprototype til Tema 2 på multimediedesigneruddannelsen.

- [Publiceret website](https://magnusmoller.com/red-sea-ready/)
- [Figma-design og prototype](https://www.figma.com/design/3CO1SwagXa3YgWIbtiwj62)
- [Designanalyse og AI-dokumentation](https://docs.google.com/document/d/1zpCpLYJrGGZ4yCNS_uM5PPEDJSvuGD60YAgMaaq8hkM/edit)

## Indhold

Seks responsive sider om dykkerforløb, sikkerhed, Rødehavet, kontakt og kilder. Formularen sender ingen data.

## Baggrundslyd

Magnus har leveret og valgt optagelsen med hav-/dykkerlyd. Den er klargjort som et dæmpet MP3-loop på cirka 28 sekunder i `assets/audio/red-sea-ambience.mp3`. `AUDIO_SOURCE` i `ambient-audio.js` peger på denne fil. Lydændringen blev publiceret på Simply og GitHub den 2. oktober 2026. Livekontrollen verificerede afspilning efter første almindelige klik, aktivt loop og genoptagelse af position ved navigation mellem forsiden og forløbssiden uden konsolfejl. Lydkvaliteten er ikke subjektivt vurderet i denne tekniske kontrol. En tom central kilde deaktiverer lyden helt, uden at oprette en lydafspiller eller hente en lydfil.

Siden forsøger at afspille lydfilen automatisk i loop. Hvis browseren blokerer lydstart, forsøges igen ved det første faktiske klik eller almindelige tastetryk; automatisk afspilning med lyd kan ikke garanteres. Der er ingen lydknap, player eller volumekontrol på siden. Lyd slukkes via browserens eller computerens lydstyring. Afspilningsposition gemmes om muligt under sideskift i samme fane, men skift mellem statiske sider kan give en kort afbrydelse. Løsningen opfylder ikke fuldt WCAG-kravet Audio Control uden en særskilt funktion til stop eller lydstyrke på siden.

## Video i destinationsfeltet

Forsidens billedfelt ved “Rejsen giver læringen liv” bruger den videofil, Magnus har leveret og valgt. Hele videoforløbet på 58,133 sekunder er bevaret i `assets/video/red-sea-underwater.mp4`. Originalen er urørt. Webkopien er H.264 MP4 i 960 × 540 ved 30 billeder i sekundet, med let støjdæmpning og uden optagelsens lyd eller private metadata.

`data-video-src` i `index.html` peger på filen. `destination-video.js` starter et tavst loop, når feltet er synligt. Videoen fylder samme afrundede 4:3-felt med `object-fit: cover`; det brede udsnit bliver derfor beskåret i siderne. Baggrundslyden styres fortsat separat. En lille pause-/afspilknap gælder kun videoen. Ved reduceret bevægelse, afspilningsblokering eller en ugyldig fil bruges fotografiet som reserve. En tom `data-video-src` deaktiverer videoen uden mediehentning. Ingen ekstern afspiller er tilføjet.

## Verificeret

- Kontrolleret ved 1440 px og 390 px.
- Ingen manglende billeder eller lokale links.
- Ingen vandret scrolling eller afskåret tekst på mobil.
- Mobilmenu, Escape-lukning og lokal formularbekræftelse er testet.
- Fotografierne er hentet fra Pexels; præcise krediteringer står på kilder.html.

## Afgrænsning

Projektet er et selvstændigt studieprojekt og ikke et faktisk rejsetilbud.
