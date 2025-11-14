
import random

class Haustier:
    """Extended virtual pet with personality, mood and day-cycle."""

    def __init__(self, name: str, tierart: str, persoenlichkeit: str = "neutral"):
        self.name = name
        self.tierart = tierart
        self.persoenlichkeit = persoenlichkeit  # calm, energetic, sensitive

        # Grundwerte
        self.hunger = 50
        self.glueck = 50
        self.energie = 50
        self.gesundheit = 80
        self.stimmung = "neutral"

        # Erweiterungen
        self.alter = 0          # days
        self.xp = 0             # experience points
        self.level = 1

        print(f"{self.name} ({self.tierart}) wurde erstellt. Persönlichkeit: {self.persoenlichkeit}")

    # ---------------- Grundaktionen ----------------

    def fuettern(self):
        """Feed the pet and adjust hunger/health based on personality."""
        reduktion = 20
        if self.persoenlichkeit == "energiegeladen":
            reduktion = 18  # energetic animals eat more often
        elif self.persoenlichkeit == "ruhig":
            reduktion = 22  # calm animals need less energy

        self.hunger = max(0, self.hunger - reduktion)
        self.gesundheit = min(100, self.gesundheit + 4)
        self.xp += 5

        print(f"{self.name} bekommt Futter. Hunger: {self.hunger}, Gesundheit: {self.gesundheit}")

    def spielen(self):
        """Play with the pet. Mood and personality influence results."""
        glueck_plus = 15
        energie_minus = 10

        if self.persoenlichkeit == "energiegeladen":
            glueck_plus = 18
            energie_minus = 8
        elif self.persoenlichkeit == "sensibel":
            glueck_plus = 13

        self.glueck = min(100, self.glueck + glueck_plus)
        self.energie = max(0, self.energie - energie_minus)
        self.xp += 8

        print(f"Du spielst mit {self.name}. Glück: {self.glueck}, Energie: {self.energie}")

    def schlafen(self):
        """Sleep restores energy but also increases hunger."""
        self.energie = min(100, self.energie + 28)
        self.hunger = min(100, self.hunger + 9)

        print(f"{self.name} schläft und erholt sich. Energie: {self.energie}, Hunger: {self.hunger}")

    def baden(self):
        """Bath improves health and mood moderately."""
        self.gesundheit = min(100, self.gesundheit + 10)
        self.glueck = min(100, self.glueck + 8)
        print(f"{self.name} wird gebadet. Gesundheit + Glück steigen leicht.")

    def streicheln(self):
        """Petting boosts happiness depending on personality."""
        if self.persoenlichkeit == "sensibel":
            boost = 12
        else:
            boost = 8

        self.glueck = min(100, self.glueck + boost)
        print(f"Du streichelst {self.name}. Glück: {self.glueck}")

    # ---------------- Erweiterte Logik ----------------

    def _aktualisiere_stimmung(self):
        """Determine mood based on stats."""
        if self.glueck > 70 and self.gesundheit > 60:
            self.stimmung = "sehr glücklich"
        elif self.gesundheit < 40 or self.glueck < 30:
            self.stimmung = "traurig"
        elif self.energie < 20:
            self.stimmung = "müde"
        else:
            self.stimmung = "neutral"

    def _level_up_pruefen(self):
        """Simple level-up system based on XP."""
        grenze = self.level * 35
        if self.xp >= grenze:
            self.level += 1
            self.xp = 0
            print(f"{self.name} steigt auf Level {self.level} auf!")

    def zufaelliges_event(self):
        """Small random event per day (balanced, not too strong)."""
        ereignis = random.choice(["bonus", "mini", "krank", "nichts"])

        if ereignis == "bonus":
            self.glueck = min(100, self.glueck + 7)
            print(f" {self.name} hat etwas gefunden und freut sich!")
        elif ereignis == "mini":
            self.xp += 3
        elif ereignis == "krank":
            self.gesundheit = max(0, self.gesundheit - 10)
            print(f" {self.name} fühlt sich nicht ganz fit.")

    def naechster_tag(self):
        """Simulate one day with natural stat changes."""
        self.alter += 1

        # natürliche Veränderungen
        self.hunger = min(100, self.hunger + 5)
        self.energie = max(0, self.energie - 4)

        self.zufaelliges_event()
        self._aktualisiere_stimmung()
        self._level_up_pruefen()

        print(f"Ein neuer Tag beginnt für {self.name}. Alter: {self.alter} Tage.")

    # ---------------- Status & Warnungen ----------------

    def status(self):
        """Show complete status."""
        print("\n--- STATUS ---")
        print(f"Name: {self.name}")
        print(f"Tierart: {self.tierart}")
        print(f"Persönlichkeit: {self.persoenlichkeit}")
        print(f"Alter: {self.alter} Tage")
        print(f"Level: {self.level}")
        print(f"Hunger: {self.hunger}")
        print(f"Glück: {self.glueck}")
        print(f"Energie: {self.energie}")
        print(f"Gesundheit: {self.gesundheit}")
        print(f"Stimmung: {self.stimmung}")
        print("-------------\n")

    def zustand_pruefen(self):
        """Warnings for critical conditions."""
        if self.hunger > 80:
            print(f"{self.name} ist sehr hungrig!")
        if self.glueck < 30:
            print(f"{self.name} ist unglücklich.")
        if self.energie < 15:
            print(f"{self.name} ist extrem müde.")
        if self.gesundheit < 40:
            print(f"{self.name} ist gesundheitlich angeschlagen.")

# ----------------- Beispiel-Verwendung -----------------

haustier1 = Haustier("Bello", "Hund", persoenlichkeit="energiegeladen")
haustier1.status()
haustier1.fuettern()
haustier1.spielen()
haustier1.naechster_tag()
haustier1.status()

haustier2 = Haustier("Mimi", "Katze", persoenlichkeit="sensibel")
haustier2.streicheln()
haustier2.baden()
haustier2.naechster_tag()
haustier2.status()