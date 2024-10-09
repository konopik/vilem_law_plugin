# Jak načíst Chrome rozšíření z lokálního repozitáře

### 1. Klonování nebo stažení repozitáře
- Nejprve naklonujte repozitář z GitHubu nebo jiného zdroje pomocí příkazu `git clone`, nebo stáhněte přímo soubor `.zip`:
  - Pro klonování spusťte:
    ```bash
    git clone https://github.com/konopik/vilem_law_plugin.git
    ```
  - Pokud stáhnete soubor `.zip`, extrahujte/rozbalte jej do složky na vašem počítači.

### 2. Rozbalení Zipu (pokud je to nutné)
- Pokud jste stáhli soubor `.zip`, klikněte pravým tlačítkem na soubor a vyberte **Extrahovat vše** pro rozbalení do adresáře na vašem počítači.

### 3. Otevření nastavení rozšíření Chrome
- Otevřete Google Chrome.
- Do adresního řádku napište `chrome://extensions/` a stiskněte **Enter**.
- Nyní budete v nastavení **Rozšíření**.

### 4. Povolení režimu vývojáře
- V pravém horním rohu stránky Rozšíření přepněte přepínač do polohy **Režim vývojáře**. To vám umožní načítat rozbalená rozšíření.

### 5. Načtení rozbaleného rozšíření
- Klikněte na tlačítko **Načíst rozbalené**.
- Přejděte do složky, kde jste rozbalili nebo naklonovali repozitář, a vyberte ji. Konkrétně byste měli vybrat složku `src`, která obsahuje soubor `manifest.json`.

### 6. Povolení rozšíření
- Jakmile je rozšíření načteno, ujistěte se, že je povoleno zkontrolováním přepínače pod kartou rozšíření.

### 7. Aktivace rozšíření
- Klikněte na ikonu rozšíření vedle adresního řádku a na rozšíření s název "vilda to the rescue".

### Ověření rozšíření
Otestujte rozšíření na různých webech, jako například:
- https://www.okoun.cz/
- https://www.lupa.cz/
- https://www.abclinuxu.cz/
- https://www.csfd.cz/
- https://www.naucmese.cz/
- https://rychlost.cz/ (poznámka: může se chovat podivně u první otázky)

Na některých stránkách můžete narazit na problémy, jako například:
- http://linkuj.cz/
- http://www.knihi.cz/
