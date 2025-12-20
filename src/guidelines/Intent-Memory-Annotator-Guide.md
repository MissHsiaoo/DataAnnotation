# Intent & Memory Human Annotation Toolkit - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Two-Stage Annotation Workflow](#two-stage-annotation-workflow)
4. [Intent Annotation (Stage 1)](#intent-annotation-stage-1)
5. [Memory Extraction (Stage 2)](#memory-extraction-stage-2)
6. [Navigation & Session Management](#navigation--session-management)
7. [No Memory Feature](#no-memory-feature)
8. [Data Format & Export](#data-format--export)
9. [Configuration](#configuration)
10. [Tips & Best Practices](#tips--best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

**Intent & Memory Human Annotation Toolkit** is a dual-stage annotation system designed for conversational AI research. It enables researchers to:

1. **Classify user intents** using an 8-category taxonomy with 3 subtypes each
2. **Extract structured long-term memories** using a 27-label schema across 6 categories

### Key Features

- 🎯 **Two-Stage Workflow**: Intent classification → Memory extraction
- 📊 **8 Intent Categories**: Each with 3 specialized subtypes (24 total intents)
- 🧠 **27 Memory Labels**: Organized into 6 semantic categories
- 🔍 **Evidence-Based Annotation**: Select specific user utterances as evidence
- 📝 **Structured Reasoning**: Required reasoning field for each annotation
- 🚀 **Efficient Navigation**: Previous/Next buttons + Jump to session #
- ⚡ **No Memory Quick-Skip**: One-click to mark sessions with no extractable memories
- 💾 **Complete Export**: Download NDJSON with both `intents_ranked` and `memory_items`

---

## Getting Started

### Step 1: Upload Data

1. Click **Upload NDJSON File** button
2. Select your conversation data file (`.ndjson` or `.jsonl`)
3. The system automatically detects the format:
   - **Standard format**: `{turns: [{speaker, utterance_index, text}], ...}`
   - **Conversation format**: `{conversation: [{role: 'human'/'assistant', content}], ...}`

### Step 2: Start with Intent Annotation

1. Review the conversation display
2. Click on **user utterances** (blue highlights) to select evidence
3. Add up to **2 intents** with probabilities that sum to 1.0
4. Provide reasoning for each intent

### Step 3: Extract Memories

1. After completing intents, click **"Start Memory Extraction"**
2. Select user utterances as evidence
3. Add memory items using the structured form
4. Or click **"No Memory"** if no memories should be extracted

### Step 4: Navigate & Export

1. Use **Next** button or **Jump to session #** to move between sessions
2. Click **Download Annotated NDJSON** when ready to export
3. File includes all modifications with original data

---

## Two-Stage Annotation Workflow

### Stage 1: Intent Annotation

```
1. Review conversation
   ↓
2. Identify user's primary intent(s)
   ↓
3. Select 1-2 intents from taxonomy
   ↓
4. Assign probabilities (must sum to 1.0)
   ↓
5. Click user utterances as evidence
   ↓
6. Write reasoning for each intent
   ↓
7. Save intents
```

### Stage 2: Memory Extraction

```
8. Click "Start Memory Extraction"
   ↓
9. Review conversation for memory-worthy information
   ↓
10. Select user utterances as evidence
   ↓
11. Add memory items OR click "No Memory"
   ↓
12. Navigate to next session
```

### Visual Workflow

```
┌─────────────────┐
│ Upload NDJSON   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Intent Stage    │ ← Select utterances
│ (1-2 intents)   │   Assign probabilities
│                 │   Write reasoning
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Memory Stage    │ ← Extract 0-5 memories
│ (0-5 memories)  │   OR click "No Memory"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Next Session    │ ← Navigate or Jump
└─────────────────┘
```

---

## Intent Annotation (Stage 1)

### Intent Taxonomy Overview

| Category | Subtypes | Description |
|----------|----------|-------------|
| **Memory Inquiry** | `query_history`, `recall_preference`, `relationship_check` | User asks to recall past information |
| **Preference/Opinion** | `state_preference`, `evaluate_opinion`, `compare_options` | User expresses likes/dislikes/opinions |
| **Memory Update** | `correct_memory`, `add_new_info`, `delete_memory` | User wants to modify stored information |
| **Identity/Self-disclosure** | `reveal_identity`, `share_experience`, `describe_state` | User shares personal information |
| **Planning/Scheduling** | `arrange_event`, `set_reminder`, `discuss_timeline` | User discusses future plans |
| **Emotional Support** | `seek_comfort`, `express_emotion`, `request_empathy` | User seeks emotional support |
| **Information Seeking** | `ask_factual`, `how_to_question`, `explanation_request` | User asks for factual information |
| **Casual/Chitchat** | `greeting`, `small_talk`, `casual_remark` | General conversation |

### Intent Annotation Rules

#### ✅ Required Fields

1. **Intent Category + Subtype**: Must select from predefined taxonomy
2. **Probability**: 0.0 to 1.0, all intents must sum to 1.0
3. **Evidence**: At least 1 user utterance selected (highlighted in blue)
4. **Reasoning**: 1-3 sentences explaining why this intent was chosen

#### 📊 Probability Guidelines

- **Single intent**: Set probability to `1.0`
- **Two intents**: Split probability (e.g., `0.7` and `0.3`, or `0.6` and `0.4`)
- **Must sum to 1.0**: System validates before saving

#### 🎯 Intent Selection Strategy

**Primary Intent**
- The main goal or purpose of the user's message
- Usually the most explicit or central theme
- Assign higher probability (0.6-1.0)

**Secondary Intent** (optional)
- A secondary theme or implicit goal
- Less central but still present
- Assign lower probability (0.1-0.4)

**Example:**
```
User: "Do you remember where I went on vacation? I'd like to plan another trip there."

Primary Intent: Memory Inquiry / query_history (0.6)
Secondary Intent: Planning/Scheduling / discuss_timeline (0.4)
```

### Evidence Selection

1. **Click user utterances** in the conversation viewer
2. They will highlight in **blue** when selected
3. At least **1 utterance required** per intent
4. Multiple utterances can be selected for strong evidence

---

## Memory Extraction (Stage 2)

### Memory Taxonomy Overview

#### 6 Memory Categories (27 Labels)

**1. Identity (6 labels)**
- `Identity/basic_info` - Name, age, gender, hometown
- `Identity/occupation` - Job, career, work details
- `Identity/education` - School, degree, major
- `Identity/family_composition` - Family members, structure
- `Identity/life_stage` - Student, working, retired
- `Identity/personality` - Character traits

**2. Preferences (6 labels)**
- `Preferences/food_drink` - Food/beverage likes/dislikes
- `Preferences/entertainment` - Movies, music, books
- `Preferences/lifestyle` - Daily habits, routines
- `Preferences/values` - Beliefs, principles
- `Preferences/aesthetics` - Design, style preferences
- `Preferences/communication_style` - How they prefer to interact

**3. Activities (5 labels)**
- `Activities/hobbies` - Regular leisure activities
- `Activities/sports_exercise` - Physical activities
- `Activities/social_activities` - Social engagements
- `Activities/creative_work` - Art, writing, music creation
- `Activities/volunteer_community` - Community involvement

**4. Belongings (3 labels)**
- `Belongings/pets` - Pet ownership
- `Belongings/vehicles` - Car, bike, etc.
- `Belongings/significant_items` - Important possessions

**5. Relationships (4 labels)**
- `Relationships/family` - Family relationships
- `Relationships/romantic` - Romantic partners
- `Relationships/friends` - Friendships
- `Relationships/professional` - Work relationships

**6. Goals/Plans (3 labels)**
- `Goals/short_term` - Near-future goals
- `Goals/long_term` - Life goals, aspirations
- `Goals/ongoing_projects` - Current projects

### Memory Item Structure

Each memory item requires:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **Memory ID** | Auto | Auto-generated (`m1`, `m2`, ...) | `m1` |
| **Type** | Required | `direct` or `indirect` | `direct` |
| **Category** | Required | One of 6 categories | `Preferences` |
| **Label** | Required | One of 27 labels | `Preferences/food_drink` |
| **Value** | Required | Short description | "Loves spicy food, especially Sichuan cuisine" |
| **Reasoning** | Required | Why extract this? (1-3 sentences) | "User explicitly stated preference for spicy food and mentioned Sichuan as favorite" |
| **Evidence** | Auto | Selected user utterance(s) | Session + utterance index |
| **Confidence** | Required | 0.0 to 1.0 | `0.9` |
| **Time Scope** | Required | `recent`, `long_term`, `past_only`, `unknown` | `long_term` |
| **Emotion** | Optional | `Positive`, `Negative`, `Neutral`, or null | `Positive` |
| **Preference Attitude** | Conditional | `like` or `dislike` (REQUIRED for Preference labels) | `like` |

### Memory Extraction Rules

#### ✅ What to Extract

- **Stable preferences** that persist over time
- **Identity information** unlikely to change frequently
- **Long-term goals and plans**
- **Established relationships**
- **Significant possessions**
- **Regular activities and hobbies**

#### ❌ What NOT to Extract

- One-off facts or temporary states
- Short-term tasks ("buy milk today")
- Debug information or system messages
- Highly volatile information
- Context-specific preferences

#### 🎯 Quality Guidelines

1. **Specificity**: Be as specific as possible
   - ✅ Good: "Allergic to peanuts and tree nuts"
   - ❌ Bad: "Has allergies"

2. **Stability**: Extract information likely to remain true
   - ✅ Good: "Vegetarian for ethical reasons"
   - ❌ Bad: "Ate salad for lunch today"

3. **Relevance**: Focus on information useful for future interactions
   - ✅ Good: "Prefers morning meetings before 10am"
   - ❌ Bad: "Said 'um' twice in conversation"

### Preference Label Rules

**⚠️ IMPORTANT: Preference labels MUST have `preference_attitude`**

- If label starts with `Preferences/`: **MUST** set attitude to `like` or `dislike`
- Non-preference labels: **MUST NOT** have preference_attitude

```
✅ CORRECT:
Label: Preferences/food_drink
Attitude: like

❌ INCORRECT:
Label: Preferences/food_drink
Attitude: null  ← VALIDATION ERROR!
```

### Memory Type: Direct vs Indirect

**Direct Memory**
- User explicitly states the information
- Clear, unambiguous statement
- Example: "I love skiing" → Activity/sports_exercise

**Indirect Memory**
- Inferred from user's statements or behavior
- Requires interpretation
- Example: "I go to the slopes every weekend in winter" → Activity/sports_exercise (inferred love of skiing)

### Typical Memory Count

- **0-5 memories per session** is normal
- Most sessions: **0-2 memories**
- Complex sessions: **3-5 memories**
- Empty sessions: Use **"No Memory"** button

---

## Navigation & Session Management

### Navigation Controls

| Control | Action | Shortcut |
|---------|--------|----------|
| **Previous** button | Go to previous session | N/A |
| **Next** button | Go to next session | N/A |
| **Jump to # input** | Type session number and press Enter | Direct jump |
| **Current/Total display** | Shows progress (e.g., "Session 5 / 100") | N/A |

### Jump to Session Feature

1. Look at the input field showing "Jump to #"
2. Click the input field
3. Type the session number (e.g., `25`)
4. Press **Enter**
5. System loads that session immediately

**Use Cases:**
- Return to a session you want to review
- Skip to a specific conversation ID
- Jump to bookmarked sessions

### Progress Tracking

The interface shows:
```
Session 42 / 250  [Previous] [Next]  Jump to: [  ]
```

- **42** = Current session (1-indexed)
- **250** = Total sessions in file
- Navigate sequentially or jump directly

---

## No Memory Feature

### When to Use "No Memory"

Click the **"No Memory"** button when:

- ✅ Conversation is purely chitchat with no personal information
- ✅ User only asks factual questions without revealing anything
- ✅ Dialogue is too short or meaningless to extract memories
- ✅ Information is temporary or context-specific only

### How It Works

1. Click **"No Memory"** button (visible in Memory Extraction stage)
2. System saves `memory_items: []` (empty array) to the session
3. Automatically advances to next session after 0.5 seconds
4. Toast notification confirms: "Marked as 'No Memory' - skipping to next session"

### Button Behavior

**When no memories added yet:**
```
┌─────────────────────────────────────────────┐
│ 🚫 No Memories to Extract - Skip to Next   │
└─────────────────────────────────────────────┘
```

**When some memories already added:**
```
┌─────────────────────────────────────────────┐
│ 🚫 Skip Memory Extraction (No Additional)   │
└─────────────────────────────────────────────┘
```

### Workflow with No Memory

```
Standard Workflow:
Intent → Memory Extraction → Save Memories → Next

Fast Workflow (No Memory):
Intent → Memory Extraction → Click "No Memory" → Auto-advance to Next
```

**Time Saved:** ~5-10 seconds per empty session

---

## Data Format & Export

### Supported Input Formats

The system auto-detects two NDJSON formats:

#### Format 1: Standard Turns Format
```json
{
  "session_id": "s001",
  "user_id": "u123",
  "turns": [
    {"speaker": "user", "utterance_index": 0, "text": "Hello"},
    {"speaker": "assistant", "utterance_index": 1, "text": "Hi there!"}
  ]
}
```

#### Format 2: Conversation Format
```json
{
  "session_id": "s001",
  "user_id": "u123",
  "conversation": [
    {"role": "human", "content": "Hello"},
    {"role": "assistant", "content": "Hi there!"}
  ]
}
```

**Auto-conversion:** Format 2 is automatically converted to Format 1 with `utterance_index` added.

### Export Format

Downloaded NDJSON file includes original data + annotations:

```json
{
  "session_id": "s001",
  "user_id": "u123",
  "turns": [...],
  "intents_ranked": [
    {
      "intent_category": "Preference/Opinion",
      "intent_subtype": "state_preference",
      "probability": 1.0,
      "reasoning": "User explicitly states food preference",
      "evidence_utterances": [0, 2]
    }
  ],
  "memory_items": [
    {
      "memory_id": "m1",
      "type": "direct",
      "label": "Preferences/food_drink",
      "value": "Loves spicy Sichuan cuisine",
      "reasoning": "Explicitly stated preference",
      "evidence": {
        "session_id": "s001",
        "utterance_index": 2,
        "text": "I love spicy food, especially Sichuan"
      },
      "confidence": 0.9,
      "time_scope": "long_term",
      "emotion": "Positive",
      "preference_attitude": "like",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Download Behavior

1. Click **Download Annotated NDJSON** button
2. System merges all modifications with original data
3. File naming: `annotated-{original-filename}-{timestamp}.ndjson`
4. Toast shows: "Downloaded with X modifications"

---

## Configuration

### Intent Taxonomy Configuration

Edit `/config/intent-config.ts` to customize intents:

```typescript
export const intentCategories = [
  {
    id: 'memory_inquiry',
    name: 'Memory Inquiry',
    subtypes: [
      { id: 'query_history', name: 'Query History' },
      { id: 'recall_preference', name: 'Recall Preference' },
      { id: 'relationship_check', name: 'Relationship Check' }
    ]
  },
  // ... more categories
];
```

### Memory Taxonomy Configuration

Edit `/config/memory-taxonomy.ts` to customize memory labels:

```typescript
export const memoryLabels = [
  {
    id: 'Identity/basic_info',
    category: 'Identity',
    name: 'Basic Information',
    examples: ['Name: Sarah', 'Age: 28']
  },
  // ... more labels
];
```

### Customization Options

- **Add new intent categories**: Define new category + subtypes
- **Modify existing intents**: Change names, descriptions
- **Add memory labels**: Expand to new domains (e.g., Health, Finance)
- **Change validation rules**: Adjust probability constraints

---

## Tips & Best Practices

### 🎯 Intent Annotation Best Practices

1. **Read the entire conversation first** - Get full context before annotating
2. **Focus on user's goal** - What does the user want to accomplish?
3. **Use 2 intents sparingly** - Only when genuinely mixed
4. **Be consistent** - Apply taxonomy consistently across sessions
5. **Write clear reasoning** - Explain your thought process

### 🧠 Memory Extraction Best Practices

1. **Quality over quantity** - 1-2 good memories > 5 mediocre ones
2. **Think long-term** - Would this be useful a month from now?
3. **Be specific** - Include details that add value
4. **Use Direct when possible** - Only use Indirect for inferred info
5. **Set realistic confidence** - Be honest about certainty (0.7-0.9 typical)

### ⚡ Efficiency Tips

1. **Master the "No Memory" button** - Don't waste time on empty sessions
2. **Use Jump feature** - Quickly return to sessions needing review
3. **Save frequently** - Download every 50-100 sessions
4. **Batch similar sessions** - Annotate similar conversation types together
5. **Take breaks** - Annotation quality drops with fatigue

### 📊 Quality Control

1. **Review before saving** - Double-check probabilities sum to 1.0
2. **Validate evidence** - Ensure selected utterances support the annotation
3. **Check Preference attitudes** - Verify all Preference labels have attitude set
4. **Spot-check exports** - Periodically review exported data
5. **Maintain annotation log** - Note any ambiguous cases for discussion

---

## Troubleshooting

### Issue: File won't upload

**Possible Causes:**
- File is not valid NDJSON
- File encoding is not UTF-8
- Empty file or malformed JSON

**Solutions:**
1. Validate file format (one JSON object per line)
2. Check encoding (should be UTF-8)
3. Test with a small sample file first
4. Check browser console for specific errors

---

### Issue: Can't save intents - "Probabilities must sum to 1.0"

**Cause:** Intent probabilities don't add up to exactly 1.0

**Solutions:**
1. Check probability values (e.g., 0.6 + 0.4 = 1.0 ✅)
2. Avoid values like 0.33 + 0.67 = 1.00 (might be 0.999999)
3. Use increments of 0.1 or 0.05 for easier calculation

---

### Issue: "Preference labels must have preference_attitude"

**Cause:** Selected a Preference label but left attitude as "None"

**Solutions:**
1. If label starts with `Preferences/`: Set attitude to `like` or `dislike`
2. If not a preference: Choose a different label category

---

### Issue: Memory extraction form is disabled

**Cause:** Haven't completed intent annotation yet

**Solutions:**
1. Complete and save intent annotations first
2. Click "Start Memory Extraction" button
3. System enforces two-stage workflow

---

### Issue: "No Memory" button doesn't advance to next session

**Cause:** Already on the last session

**Solutions:**
1. Check session counter (e.g., "250 / 250")
2. If on last session, button saves but doesn't advance
3. Download your annotations

---

### Issue: Download doesn't include all annotations

**Possible Causes:**
- Modifications not saved properly
- Browser cache issue

**Solutions:**
1. Verify modification count in download toast
2. Re-annotate missing sessions
3. Try refreshing the page and re-uploading file
4. Check browser console for errors

---

### Issue: Jump to session doesn't work

**Cause:** Invalid session number entered

**Solutions:**
1. Enter a number between 1 and total sessions
2. Press Enter after typing the number
3. Check that you clicked inside the input field first

---

## Advanced Usage

### Annotation Strategy for Large Datasets

For datasets with **500+ sessions**:

1. **First Pass (Intents Only)**
   - Annotate all intents without memory extraction
   - Use "No Memory" to quickly skip through
   - Focus on consistent intent classification

2. **Second Pass (Memories)**
   - Review sessions with specific intent types
   - Use Jump feature to target sessions
   - Extract memories systematically

3. **Download Checkpoints**
   - Export every 100 sessions
   - Name files with progress (e.g., `annotated-1-100.ndjson`)
   - Merge files later if needed

### Multi-Annotator Workflow

When multiple annotators work on the same dataset:

1. **Split dataset** - Divide sessions across annotators
2. **Use consistent guidelines** - Share this guide with all annotators
3. **Inter-annotator agreement** - Periodically cross-check annotations
4. **Merge outputs** - Combine NDJSON files after completion

### Handling Edge Cases

**Ambiguous Intents**
- Default to most explicit intent
- Use lower probability for uncertain intents
- Document reasoning clearly

**Mixed Languages**
- Annotate in the language used
- Extract memories in source language
- Note language in reasoning if relevant

**Incomplete Conversations**
- Annotate what's available
- Use "unknown" time_scope if uncertain
- Lower confidence scores (0.5-0.7)

---

## Keyboard Shortcuts (Future Feature)

Currently, the system is mouse-driven. Potential shortcuts:

| Shortcut | Action |
|----------|--------|
| **Ctrl+S** | Save current annotations |
| **Ctrl+→** | Next session |
| **Ctrl+←** | Previous session |
| **Ctrl+N** | Click "No Memory" |
| **Ctrl+J** | Focus "Jump to" input |

*Not yet implemented - use mouse navigation for now*

---

## Appendix: Complete Intent Taxonomy

### Memory Inquiry
- `query_history` - Ask about past events/information
- `recall_preference` - Ask what user previously liked/disliked
- `relationship_check` - Verify information about relationships

### Preference/Opinion
- `state_preference` - Express like/dislike
- `evaluate_opinion` - Give opinion on topic
- `compare_options` - Compare choices

### Memory Update
- `correct_memory` - Fix wrong information
- `add_new_info` - Add new personal information
- `delete_memory` - Remove stored information

### Identity/Self-disclosure
- `reveal_identity` - Share personal identity details
- `share_experience` - Tell about experiences
- `describe_state` - Describe current state/situation

### Planning/Scheduling
- `arrange_event` - Plan future event
- `set_reminder` - Create reminder
- `discuss_timeline` - Talk about schedules

### Emotional Support
- `seek_comfort` - Ask for emotional support
- `express_emotion` - Share feelings
- `request_empathy` - Ask for understanding

### Information Seeking
- `ask_factual` - Ask factual question
- `how_to_question` - Ask how to do something
- `explanation_request` - Ask for explanation

### Casual/Chitchat
- `greeting` - Hello/goodbye
- `small_talk` - Light conversation
- `casual_remark` - Random comment

---

## Appendix: Complete Memory Taxonomy

### Identity (6)
1. `Identity/basic_info` - Name, age, gender, hometown
2. `Identity/occupation` - Job, career details
3. `Identity/education` - School, degree, major
4. `Identity/family_composition` - Family structure
5. `Identity/life_stage` - Student, working, retired
6. `Identity/personality` - Character traits

### Preferences (6)
1. `Preferences/food_drink` - Food/beverage preferences
2. `Preferences/entertainment` - Movies, music, books
3. `Preferences/lifestyle` - Daily habits, routines
4. `Preferences/values` - Beliefs, principles
5. `Preferences/aesthetics` - Design, style preferences
6. `Preferences/communication_style` - Interaction preferences

### Activities (5)
1. `Activities/hobbies` - Leisure activities
2. `Activities/sports_exercise` - Physical activities
3. `Activities/social_activities` - Social engagements
4. `Activities/creative_work` - Art, writing, music
5. `Activities/volunteer_community` - Community work

### Belongings (3)
1. `Belongings/pets` - Pet ownership
2. `Belongings/vehicles` - Transportation owned
3. `Belongings/significant_items` - Important possessions

### Relationships (4)
1. `Relationships/family` - Family relationships
2. `Relationships/romantic` - Romantic partners
3. `Relationships/friends` - Friendships
4. `Relationships/professional` - Work relationships

### Goals/Plans (3)
1. `Goals/short_term` - Near-future goals
2. `Goals/long_term` - Life aspirations
3. `Goals/ongoing_projects` - Current projects

---

## Version History

### Version 1.0 (Current)
- ✅ Dual-stage annotation system (Intent → Memory)
- ✅ 8 intent categories with 3 subtypes each
- ✅ 27 memory labels across 6 categories
- ✅ Evidence-based annotation with reasoning
- ✅ "No Memory" quick-skip feature
- ✅ Previous/Next + Jump navigation
- ✅ Auto-format detection (2 NDJSON formats)
- ✅ Complete NDJSON export with all modifications
- ✅ Academic professional UI design

---

## Support & Customization

### Configuration Files
- `/config/intent-config.ts` - Intent taxonomy
- `/config/memory-taxonomy.ts` - Memory label system
- `/styles/globals.css` - UI styling

### Code Structure
- `/IntentApp.tsx` - Main application logic
- `/components/IntentAnnotationForm.tsx` - Intent annotation UI
- `/components/MemoryExtractionForm.tsx` - Memory extraction UI
- `/components/ConversationViewer.tsx` - Conversation display

### Extending Functionality

The toolkit is designed for extensibility:

1. **Add intent categories**: Edit `intent-config.ts`
2. **Add memory labels**: Edit `memory-taxonomy.ts`
3. **Customize validation**: Modify form components
4. **Change UI styling**: Edit `globals.css`

---

## Citation

If you use this annotation toolkit in your research, please cite:

```
[Your Research Group]
Intent & Memory Human Annotation Toolkit
Version 1.0, 2025
```

---

**Intent & Memory Human Annotation Toolkit** - Built for conversational AI research and human-in-the-loop annotation workflows.
