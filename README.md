# ROPEX Fishbone / 5xWhy – v2.0.4-test

Statisk webværktøj til ROPEX-arbejde med fiskeben, 5xWhy, tiltag/opgaver, projektfiler og PDF-eksport.

## v2.0.4-test

### Versionsstyring
- Denne testpakke er versionsløftet fra v2.0.3-test til **v2.0.4-test**, så hver ændringsrunde kan spores tydeligt.


### Teknisk oprydning i v2.0.4-test
- Cache-versionen for `style.css` og `script.js` er opdateret, så GitHub Pages/browseren henter de nye filer efter upload.
- Den tomme, overflødige fil `download` er fjernet fra pakken.
- Der er ikke ændret i arbejdsgangen for rodårsager og tiltag i denne version.

### Sikkerhed og kompakt rodårsagsvalg i v2.0.4-test
- **Tiltag tilføjet** på en fiskebensårsag er nu en statusmarkering og kan ikke klikkes igen for at fjerne koblingen ved et uheld.
- Det samme princip bruges på en allerede markeret 5xWhy-rodårsag: en ny klikning fjerner ikke tiltaget.
- En kobling ændres eller fjernes bevidst i tabellen **Tiltag / opgaver**.
- Rodårsager i dropdown-listen vises i en kort form: **F · årsag** for fiskeben og **5W · årsag** for 5xWhy. Den lange kontekst/path bevares som tooltip.
- Rodårsagskolonnen er gjort lidt bredere, mens Dato/Hvem/ROPEX er komprimeret, så mere af årsagsteksten er synlig direkte i tabellen.

### Rodårsag og tiltag
- En årsag på fiskebenet kan oprette et koblet tiltag via knappen **Opret tiltag**. Når den er koblet, viser årsagen **Tiltag tilføjet**.
- Et punkt i 5xWhy kan markeres som rodårsag med prikken.
- En markeret rodårsag opretter automatisk et første tiltag.
- Den samme rodårsag kan have flere tiltag ved at vælge **+ Tilføj opgave** og derefter vælge den samme årsag i dropdown-feltet **Rodårsag**.
- En almindelig opgave kan oprettes uden rodårsag.
- En fri opgave kan senere kobles til en eksisterende årsag eller 5xWhy-årsag via dropdown-feltet **Rodårsag**.
- Når en fri opgave kobles til en årsag, markeres årsagen automatisk som rodårsag.
- Hvis én af flere koblede opgaver fjernes, bevares rodårsagsmarkeringen, så længe der stadig findes et koblet tiltag.
- Ændres teksten på en koblet rodårsag, følger teksten med i Tiltag.
- Gem/åbn projekt og PDF understøtter koblingen. Ældre projektfiler bevares og migreres ved åbning.

## Funktioner
- Fiskebensdiagram
- 5xWhy-analyse
- Tiltag / opgaver
- Gem/åbn projekt som JSON
- Eksport til PDF
- Dansk, norsk og engelsk

## GitHub Pages
Projektet er statisk HTML/CSS/JavaScript og kan hostes direkte via GitHub Pages.
Alle filer i denne mappe skal uploades samlet til test-branchen.

### UI-justering i denne test
- Knappen **+ Tilføj tiltag** inde i en koblet tiltagsrække er fjernet for at undgå tvivl om, hvorvidt flere årsager kunne kobles til samme tiltag.
- Stjernen på fiskebensårsager er erstattet af en tekstknap: **Opret tiltag** / **Tiltag tilføjet**.
