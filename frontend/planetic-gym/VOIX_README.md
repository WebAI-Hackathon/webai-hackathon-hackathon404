# VOIX Web-AI Integration für Planetic Gym

## Übersicht

Diese Anwendung implementiert die VOIX (Voice Over Internet eXchange) Web-AI Interaction für den Trainingsplan-Bereich. VOIX ermöglicht es, dass Websites zu Capability Providers werden, die KI-Assistenten mit Tools und Context versorgen.

## Was ist VOIX?

VOIX basiert auf drei Kernprinzipien:

### 1. Websites as Capability Providers

Websites deklarieren:

- **Tools**: Aktionen, die ausgeführt werden können (`<tool>` Elemente)
- **Context**: Aktueller Zustand und Informationen (`<context>` Elemente)

### 2. User Sovereignty

Benutzer haben vollständige Kontrolle über:

- Welche KI sie verwenden (OpenAI, Anthropic, Google, lokale Modelle)
- Ihre Daten (Unterhaltungen berühren nie die Server der Website)
- Ihre Erfahrung (Wählen die Schnittstelle, die am besten für sie funktioniert)

### 3. Decentralized Innovation

VOIX ist ein Standard - jeder kann VOIX-kompatible Schnittstellen erstellen.

## Implementierung in Planetic Gym

### Context-Elemente

Die App stellt folgende Context-Informationen bereit:

- **trainingWeeks**: JSON mit allen Trainingswochen und deren Daten
- **selectedDay**: Aktuell ausgewählter Trainingstag
- **appState**: Aktueller Zustand der UI (geöffnete Dialoge, etc.)

### Verfügbare Tools

#### 1. `create_training_week`

Erstellt eine neue Trainingswoche

- `name` (string, required): Name der neuen Trainingswoche
- `description` (string): Beschreibung der Trainingswoche

#### 2. `create_training_day`

Erstellt einen neuen Trainingstag in einer Woche

- `weekId` (string, required): ID der Zielwoche
- `name` (string, required): Name des Trainingstags
- `focus` (string, required): Trainingsfokus (z.B. Oberkörper, Unterkörper)
- `duration` (number): Dauer in Minuten
- `exercises` (array): Liste der Übungen mit Name, Wiederholungen und Gewicht

#### 3. `edit_training_day`

Bearbeitet einen bestehenden Trainingstag

- `dayId` (string, required): ID des zu bearbeitenden Tags
- `name`, `focus`, `duration`, `exercises`: Neue Werte (optional)

#### 4. `delete_training_day`

Löscht einen Trainingstag

- `dayId` (string, required): ID des zu löschenden Tags

#### 5. `delete_training_week`

Löscht eine komplette Trainingswoche

- `weekId` (string, required): ID der zu löschenden Woche

#### 6. `start_workout`

Startet ein Training für einen bestimmten Tag

- `dayId` (string, required): ID des Trainingstags

## Verwendung

Eine KI kann mit der Seite interagieren, indem sie:

1. **Context liest**: Die aktuellen Trainingsdaten und den UI-Zustand abruft
2. **Tools aufruft**: Aktionen wie das Erstellen neuer Trainingspläne ausführt

Beispiel einer KI-Interaktion:

```
Benutzer: "Erstelle eine neue Trainingswoche namens 'Kraft Woche 3' für fortgeschrittene Nutzer"

KI liest Context → Sieht aktuelle Trainingswochen
KI ruft Tool auf → create_training_week(name: "Kraft Woche 3", description: "Für fortgeschrittene Nutzer")
```

## Technische Details

### Tool-Komponente

```tsx
<Tool name="tool_name" description="Was das Tool macht" onCall={handleFunction}>
  <prop
    name="param1"
    type="string"
    required
    description="Parameter Beschreibung"
  />
  <prop name="param2" type="number" description="Optionaler Parameter" />
</Tool>
```

### Event Handling

Tools lösen Custom Events aus, die von Event Handlers abgefangen werden:

```tsx
const handleCreateWeek = (event: Event) => {
  const details = (event as CustomEvent).detail;
  // Verwende details.name, details.description, etc.
};
```

### CSS

VOIX-Elemente werden mit CSS ausgeblendet:

```css
tool,
prop,
context,
array,
dict {
  display: none;
}
```

## Entwicklung

Die VOIX-Integration erfordert:

1. TypeScript-Deklarationen für custom elements
2. Tool-Komponente für Event-Handling
3. Context-Elemente für Zustandsinformationen
4. CSS zum Ausblenden der VOIX-Elemente

Die Integration ist transparent für normale Benutzer - sie sehen nur die normale UI, während KI-Assistenten die zusätzlichen VOIX-Funktionen nutzen können.
