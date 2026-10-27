/**
 * CrimeVision AI - Cases & Multimodal Evidence Database
 * Realistic forensic data for multiple investigations with cross-modal correlation.
 */

window.CRIME_CASES = [
  {
    id: "CASE-2026-0842",
    title: "Downtown Diamond Vault Security Breach",
    location: "442 Montgomery St, Financial District, Vault Level B2",
    date: "2026-10-24",
    timeRange: "23:12:15 - 23:17:45 UTC",
    classification: "RESTRICTED // LAW ENFORCEMENT ONLY",
    investigatingAgency: "Metropolitan Cyber & Forensic Intelligence Bureau",
    leadInvestigator: "Special Agent David Vance (Badge #7492)",
    status: "Reconstructed & Verified",
    chainOfCustodyHash: "sha256-8f4e2c91b5d634710a9f20e481c5d9e7a3b11843fa6208bb7e29a4310dfb9201",
    overallConfidence: "98.4%",
    summary: "At 23:13:42, two masked subjects entered the subterranean vault corridor via forced electronic access. Subject #1 brandished a semi-automatic handgun (classified by YOLOv10 forensic model as Glock 19, 94.8% confidence). An acoustic sensor on Bodycam-04 captured a muffled acoustic shockwave corresponding to a localized explosive charge at 23:14:02, cross-referenced with 911 dispatch caller statements. Subjects evacuated through North Alleyway into a dark sedan at 23:16:10.",
    
    streams: [
      {
        id: "CAM-01",
        name: "Sub-Vault Access Corridor",
        type: "video",
        fps: 30,
        resolution: "1920x1080 (4K Upscaled)",
        timeStart: "23:12:30",
        duration: "05:15",
        status: "Analyzed (14 Detections)",
        description: "Direct line of sight to Vault B2 heavy vault door and biometric terminal.",
        sceneType: "vault"
      },
      {
        id: "CAM-02",
        name: "North Alleyway Egress CCTV",
        type: "video",
        fps: 24,
        resolution: "1280x720",
        timeStart: "23:14:00",
        duration: "04:30",
        status: "Analyzed (8 Detections)",
        description: "Exterior alleyway camera capturing vehicle getaway and secondary suspect.",
        sceneType: "alley"
      },
      {
        id: "AUDIO-01",
        name: "Emergency 911 Dispatch Recording",
        type: "audio",
        timeStart: "23:13:50",
        duration: "03:10",
        status: "Transcribed & Diarized",
        description: "Night security officer incoming distress call with background acoustic spike.",
        sceneType: "audio"
      },
      {
        id: "AUDIO-02",
        name: "Patrol Unit #12 Dash & Bodycam Audio",
        type: "audio",
        timeStart: "23:15:20",
        duration: "02:45",
        status: "Transcribed & Diarized",
        description: "First responding patrol officer arrival and vehicle pursuit transmission.",
        sceneType: "audio"
      }
    ],

    detections: [
      {
        id: "DET-101",
        time: "23:13:42",
        stream: "CAM-01",
        category: "Person of Interest",
        label: "Subject #1 (Male, Tactical Gear)",
        confidence: 96.4,
        attributes: {
          height: "approx 182cm ± 3cm",
          clothing: "Dark hooded storm jacket, reinforced tactical gloves, neoprene balaclava",
          movementRate: "1.4 m/s (Rapid ingress)"
        },
        boundingBox: { x: 38, y: 32, w: 22, h: 58 }
      },
      {
        id: "DET-102",
        time: "23:13:45",
        stream: "CAM-01",
        category: "Weapon Detected",
        label: "Glock 19 (9mm Semi-Automatic)",
        confidence: 94.8,
        attributes: {
          classification: "Handgun / Polymer frame",
          holsterDraw: "Concealed waistband retrieval",
          magazineExt: "Standard 15-round capacity"
        },
        boundingBox: { x: 48, y: 52, w: 10, h: 14 }
      },
      {
        id: "DET-103",
        time: "23:14:02",
        stream: "AUDIO-01",
        category: "Acoustic Event",
        label: "Detonation / Hydraulic Breach Acoustic Signature",
        confidence: 98.2,
        attributes: {
          peakDecibels: "114.6 dB",
          frequencyRange: "40 Hz - 3.2 kHz",
          waveType: "Sharp impulse with low-frequency reverberation"
        }
      },
      {
        id: "DET-104",
        time: "23:14:18",
        stream: "CAM-01",
        category: "Contraband / Evidence",
        label: "High-Capacity Heavy Tactical Duffle (Heavy Load)",
        confidence: 91.5,
        attributes: {
          estimatedWeight: "22-28 kg (Biomechanic gate analysis)",
          contentsSuspected: "Safety deposit bullion containers",
          dimensions: "85cm x 40cm"
        },
        boundingBox: { x: 42, y: 64, w: 18, h: 22 }
      },
      {
        id: "DET-105",
        time: "23:15:35",
        stream: "CAM-02",
        category: "Vehicle Detected",
        label: "Dark Sedan (2022-2024 Honda Accord / Grey)",
        confidence: 89.7,
        attributes: {
          licenseStatus: "Obscured with anti-reflective coating",
          engineState: "Idling with headlights off",
          occupants: "Driver detected in seat (Subject #2)"
        },
        boundingBox: { x: 55, y: 45, w: 38, h: 42 }
      },
      {
        id: "DET-106",
        time: "23:16:10",
        stream: "CAM-02",
        category: "Rapid Movement",
        label: "Subject Egress & Vehicle Ingress",
        confidence: 95.1,
        attributes: {
          acceleration: "Sprinting at 4.8 m/s",
          doorAction: "Rear passenger door rapid shut",
          egressDirection: "Northbound on Market St alley"
        },
        boundingBox: { x: 48, y: 38, w: 20, h: 48 }
      }
    ],

    timeline: [
      {
        id: "TL-01",
        time: "23:12:18",
        category: "system",
        icon: "shield-alert",
        title: "Perimeter Alarm & Laser Sensor Trip",
        source: "CAM-01 / Building Telemetry",
        confidence: 99.1,
        severity: "medium",
        summary: "Sub-level door sensor bypassed via magnetic shim. Security panel logged fault code SEC-402.",
        linkedEvidence: "CAM-01",
        frameIndex: 12
      },
      {
        id: "TL-02",
        time: "23:13:42",
        category: "person",
        icon: "user-x",
        title: "Masked Subject #1 Ingress",
        source: "CAM-01 (Vault Corridor)",
        confidence: 96.4,
        severity: "high",
        summary: "Subject #1 enters vault antechamber carrying heavy tools and tactical duffle.",
        linkedEvidence: "CAM-01",
        frameIndex: 35
      },
      {
        id: "TL-03",
        time: "23:13:45",
        category: "weapon",
        icon: "crosshair",
        title: "Weapon Brandishing: Glock 19 Handgun",
        source: "CAM-01 YOLOv10-Forensic",
        confidence: 94.8,
        severity: "critical",
        summary: "Subject draws 9mm firearm with right hand, scanning corner cameras before aiming at electronic vault lock.",
        linkedEvidence: "CAM-01",
        frameIndex: 38
      },
      {
        id: "TL-04",
        time: "23:13:54",
        category: "audio",
        icon: "mic",
        title: "911 Call Initiated by Guard",
        source: "AUDIO-01 (911 Dispatch)",
        confidence: 98.7,
        severity: "medium",
        summary: "Guard reports: 'We have an armed breach in B2 corridor, I heard lock cutting tools!'",
        linkedEvidence: "AUDIO-01",
        frameIndex: 45
      },
      {
        id: "TL-05",
        time: "23:14:02",
        category: "incident",
        icon: "zap",
        title: "Vault Door Breached (Impulse Shockwave)",
        source: "CAM-01 & AUDIO-01 Multi-modal Fusion",
        confidence: 98.2,
        severity: "critical",
        summary: "Thermite/linear shaped charge detonation. 114.6 dB acoustic spike correlated with optical flash on CAM-01.",
        linkedEvidence: "CAM-01",
        frameIndex: 58
      },
      {
        id: "TL-06",
        time: "23:14:48",
        category: "movement",
        icon: "package",
        title: "Evidence Extraction / Duffle Loading",
        source: "CAM-01 (Vault Interior View)",
        confidence: 91.5,
        severity: "high",
        summary: "Subject emerges from vault with weighted bag (est. 25kg). Posture shifted rightward due to mass.",
        linkedEvidence: "CAM-01",
        frameIndex: 82
      },
      {
        id: "TL-07",
        time: "23:15:35",
        category: "vehicle",
        icon: "car",
        title: "Getaway Vehicle Spotted Idling in Alley",
        source: "CAM-02 (North Alley)",
        confidence: 89.7,
        severity: "high",
        summary: "Unmarked dark sedan detected waiting with brake lights illuminated. Engine running.",
        linkedEvidence: "CAM-02",
        frameIndex: 110
      },
      {
        id: "TL-08",
        time: "23:16:10",
        category: "incident",
        icon: "corner-up-right",
        title: "Suspect Ingress to Vehicle & Rapid Flight",
        source: "CAM-02 & AUDIO-02 Fusion",
        confidence: 95.1,
        severity: "critical",
        summary: "Subject enters passenger side; sedan accelerates north toward expressway at estimated 52 km/h.",
        linkedEvidence: "CAM-02",
        frameIndex: 135
      }
    ],

    audioTranscripts: [
      {
        id: "TR-01",
        time: "23:13:54",
        speaker: "Guard Jenkins (B1 Security Post)",
        text: "Dispatch, this is Jenkins at 442 Montgomery. Sensor 402 just went off on vault sub-level. Monitoring CAM-01 now...",
        emotion: "elevated-stress",
        confidence: 0.98
      },
      {
        id: "TR-02",
        time: "23:13:58",
        speaker: "Guard Jenkins",
        text: "Subject is armed! Repeat, subject has a firearm drawn, looks like a black semi-automatic! He's at the inner door!",
        emotion: "high-panic",
        confidence: 0.99
      },
      {
        id: "TR-03",
        time: "23:14:02",
        speaker: "Acoustic Detection Engine",
        text: "[ACOUSTIC ANOMALY DETECTED: 114.6 dB Detonation / Metallic Impact Surge]",
        emotion: "system-alert",
        confidence: 0.98
      },
      {
        id: "TR-04",
        time: "23:14:06",
        speaker: "Dispatcher Sarah Miller",
        text: "All units, Code 3 response to 442 Montgomery. Armed robbery in progress with reported explosion. Patrol Unit 12 advise ETA.",
        emotion: "urgent",
        confidence: 0.99
      },
      {
        id: "TR-05",
        time: "23:15:24",
        speaker: "Officer Martinez (Patrol 12)",
        text: "Unit 12 on scene. Turning into North Alley. We have tire screeches heading north toward the freeway ramp, grey or dark sedan!",
        emotion: "high-focus",
        confidence: 0.97
      }
    ],

    aiAnalysis: {
      weaponsIdentified: [
        { model: "Glock 19 Gen 5", caliber: "9x19mm Parabellum", confidence: "94.8%", triggerDiscipline: "Finger along slide (trained)" }
      ],
      personsTracked: [
        { id: "Subject #1", height: "182 cm", build: "Athletic/Tactical", gait: "Fluid, military-style weapon retention" },
        { id: "Subject #2 (Driver)", visibility: "Partial silhouette in sedan", role: "Lookout & Getaway Driver" }
      ],
      crossModalDiscrepancyCheck: "High consistency between acoustic surge (23:14:02) and optical dust wave on CAM-01 frame 58. Guard description of black handgun validated by YOLOv10 visual bounding box.",
      investigativeRecommendations: [
        "Pull ANPR camera feeds at Market St & 4th intersection between 23:15 and 23:20 for grey Honda Accord sedans.",
        "Forensic swab of magnetic lock housing on Door B2-01 for biological contact DNA.",
        "Spectrographic analysis of explosive residue at door frame 114 dB impulse point."
      ]
    }
  },

  {
    id: "CASE-2026-0919",
    title: "Metro Harbor Pier 14 Warehouse Incident",
    location: "Pier 14 Logistics Yard, Berth 3, Cargo Container Zone C",
    date: "2026-10-25",
    timeRange: "02:40:00 - 02:46:30 UTC",
    classification: "RESTRICTED // PORT AUTHORITY FORENSICS",
    investigatingAgency: "Maritime Border & Cyber Enforcement Division",
    leadInvestigator: "Inspector Elena Rostova (Badge #4819)",
    status: "Active Triangulation",
    chainOfCustodyHash: "sha256-4b19c8d76a2e4829fa0129bc6538411d0e9a712b36c498e5781a29f03d5206c1",
    overallConfidence: "96.8%",
    summary: "Suspicious nighttime cargo offload detected by thermal camera. Thermal disparity indicates cooled illicit container breach. Acoustic hydrophone recorded marine engine departure coinciding with visual vessel movement at 02:45:10.",
    
    streams: [
      {
        id: "CAM-01",
        name: "Berth 3 High-Mast Thermal / Night Vision",
        type: "video",
        fps: 30,
        resolution: "1920x1080 (FLIR Infrared)",
        timeStart: "02:40:00",
        duration: "06:30",
        status: "Analyzed (11 Detections)",
        description: "Wide angle thermal monitoring over berth and shipping container stacks.",
        sceneType: "harbor"
      },
      {
        id: "CAM-02",
        name: "Crane 04 Gantry Optical Feed",
        type: "video",
        fps: 30,
        resolution: "1920x1080",
        timeStart: "02:41:30",
        duration: "05:00",
        status: "Analyzed (7 Detections)",
        description: "Vertical overhead perspective of cargo transfer vehicle.",
        sceneType: "harbor_crane"
      },
      {
        id: "AUDIO-01",
        name: "Harbor Hydrophone & Radio Comm",
        type: "audio",
        timeStart: "02:42:00",
        duration: "04:00",
        status: "Transcribed & Acoustic Mapped",
        description: "Underwater acoustic hydrophone array combined with VHF Ch 16 marine chatter.",
        sceneType: "audio"
      }
    ],

    detections: [
      {
        id: "DET-201",
        time: "02:41:15",
        stream: "CAM-01",
        category: "Thermal Anomaly",
        label: "Cryogenic Cooling Leak / Hidden Compartment",
        confidence: 97.3,
        attributes: {
          tempDelta: "-18.4°C relative to ambient sea air",
          containerId: "MSKU-948210-4",
          surfaceGradient: "Sharply rectangular cold zone at container base"
        },
        boundingBox: { x: 30, y: 40, w: 35, h: 45 }
      },
      {
        id: "DET-202",
        time: "02:42:50",
        stream: "CAM-01",
        category: "Person of Interest",
        label: "Dock Operative with Tactical Flashlight",
        confidence: 93.6,
        attributes: {
          gear: "High-vis vest worn over dark tactical wetsuit",
          device: "Heavy hydraulic bolt cutter tool"
        },
        boundingBox: { x: 45, y: 55, w: 14, h: 32 }
      },
      {
        id: "DET-203",
        time: "02:44:10",
        stream: "CAM-01",
        category: "Weapon Detected",
        label: "Submachine Gun (SIG MPX / Compact Stock)",
        confidence: 91.2,
        attributes: {
          slingConfiguration: "Single-point bungee sling",
          barrelAttachment: "Integral acoustic suppressor"
        },
        boundingBox: { x: 42, y: 60, w: 12, h: 10 }
      },
      {
        id: "DET-204",
        time: "02:45:10",
        stream: "AUDIO-01",
        category: "Acoustic Event",
        label: "High-RPM Twin Outboard Engine Acceleration",
        confidence: 96.5,
        attributes: {
          engineType: "Twin 300HP Mercury Verado Marine Prop",
          bearing: "Heading 195° South-Southwest out of harbor",
          hydrophoneSignature: "Cavitation signature verified"
        }
      }
    ],

    timeline: [
      {
        id: "TL-201",
        time: "02:40:30",
        category: "system",
        icon: "thermometer-snowflake",
        title: "FLIR Thermal Disparity Warning",
        source: "CAM-01 Thermal Sensor",
        confidence: 97.3,
        severity: "medium",
        summary: "Container MSKU-948210-4 manifests abnormal thermal footprint (-18°C cold spot).",
        linkedEvidence: "CAM-01",
        frameIndex: 10
      },
      {
        id: "TL-202",
        time: "02:42:50",
        category: "person",
        icon: "user",
        title: "Wetsuit Operative Approaching Container",
        source: "CAM-01 / Crane Optical",
        confidence: 93.6,
        severity: "high",
        summary: "Individual wearing neoprene gear cuts security seals using powered hydraulic shears.",
        linkedEvidence: "CAM-01",
        frameIndex: 40
      },
      {
        id: "TL-203",
        time: "02:44:10",
        category: "weapon",
        icon: "crosshair",
        title: "Suppressed Submachine Gun Unslung",
        source: "CAM-01 FLIR Enhanced",
        confidence: 91.2,
        severity: "critical",
        summary: "Operative readies compact submachine gun as perimeter patrol boat sweeps spotlight.",
        linkedEvidence: "CAM-01",
        frameIndex: 75
      },
      {
        id: "TL-204",
        time: "02:45:10",
        category: "incident",
        icon: "anchor",
        title: "Go-Fast Speedboat High Speed Departure",
        source: "AUDIO-01 & CAM-01 Maritime Tracking",
        confidence: 96.5,
        severity: "critical",
        summary: "Fast craft departs Berth 3 at 38 knots, escaping radar blind zone under bridge trestle.",
        linkedEvidence: "AUDIO-01",
        frameIndex: 115
      }
    ],

    audioTranscripts: [
      {
        id: "TR-201",
        time: "02:43:10",
        speaker: "Port Guard (Berth Watchtower)",
        text: "Berth control, we have unauthorized movement by the refrigerated stack row 4.",
        emotion: "suspicious",
        confidence: 0.98
      },
      {
        id: "TR-202",
        time: "02:44:20",
        speaker: "Coast Guard Patrol 88",
        text: "Tower, this is Coast Guard 88, sweeping the jetty. We have visual on a darkened rigid inflatable boat idling by Pier 14.",
        emotion: "alert",
        confidence: 0.96
      },
      {
        id: "TR-203",
        time: "02:45:10",
        speaker: "Hydrophone Acoustic AI",
        text: "[HYDROPHONE CAVITATION SPIKE: Twin Outboard 300HP Engaged Full Throttle]",
        emotion: "system-alert",
        confidence: 0.99
      }
    ],

    aiAnalysis: {
      weaponsIdentified: [
        { model: "SIG MPX 9mm", caliber: "9x19mm", confidence: "91.2%", triggerDiscipline: "Tactical ready position" }
      ],
      personsTracked: [
        { id: "Operative #1", height: "178 cm", build: "Specialized maritime operator", gear: "Wetsuit + Tactical Vest" }
      ],
      crossModalDiscrepancyCheck: "Visual wake created by outbound vessel at 02:45:10 strictly matches acoustic high-RPM twin propeller sound wave signature within 0.4 seconds.",
      investigativeRecommendations: [
        "Coordinate with Coast Guard Cutter Active to intercept vessel trajectory heading 195° SSW.",
        "Secure container MSKU-948210-4 for chemical hazmat and narcotics sniffer inspection.",
        "Review Berth 3 crane manifest operator logs for forged transfer permits."
      ]
    }
  },

  {
    id: "CASE-2026-1004",
    title: "Apex BioTech Server Room Cyber-Physical Infiltration",
    location: "Apex BioTech Research Tower, Floor 14, Secure Server Core",
    date: "2026-10-26",
    timeRange: "19:05:00 - 19:11:00 UTC",
    classification: "RESTRICTED // CORPORATE CYBER-ESPIONAGE",
    investigatingAgency: "Federal Cyber Defense & Forensics Taskforce",
    leadInvestigator: "Special Agent Maya Lin (Badge #9021)",
    status: "Forensic Extraction Complete",
    chainOfCustodyHash: "sha256-11f8e23901ba34789bc4512da5093e117820ab4957e82931a1b490f238b699c4",
    overallConfidence: "99.2%",
    summary: "Rogue credential cloning combined with physical hardware implant (Hak5 Bash Bunny / LAN Turtle) into primary genomic database rack. Facial recognition matched former contractor using forged NFC badge.",
    
    streams: [
      {
        id: "CAM-01",
        name: "Server Core Corridor 14A",
        type: "video",
        fps: 60,
        resolution: "3840x2160 (4K)",
        timeStart: "19:05:00",
        duration: "06:00",
        status: "Analyzed (18 Detections)",
        description: "High resolution optical feed covering server rack aisles 1 through 6.",
        sceneType: "server_room"
      },
      {
        id: "AUDIO-01",
        name: "Server Room Ceiling Mic Array",
        type: "audio",
        timeStart: "19:06:00",
        duration: "04:30",
        status: "Transcribed & Acoustic Analyzed",
        description: "Multi-channel ceiling microphone capturing ambient fan noise and keystrokes.",
        sceneType: "audio"
      }
    ],

    detections: [
      {
        id: "DET-301",
        time: "19:06:12",
        stream: "CAM-01",
        category: "Person of Interest",
        label: "Subject (Disguised as IT Systems Engineer)",
        confidence: 98.9,
        attributes: {
          biometricMatch: "Marcus Kane (98.9% facial vector match)",
          clothing: "Apex BioTech staff polo, fake visitor badge #V-882",
          badgeType: "Cloned 13.56MHz Mifare Classic RFID"
        },
        boundingBox: { x: 40, y: 30, w: 20, h: 60 }
      },
      {
        id: "DET-302",
        time: "19:07:05",
        stream: "CAM-01",
        category: "Cyber Hardware Contraband",
        label: "Hardware Exfiltration Implant (LAN Turtle / USB Rubber Ducky)",
        confidence: 96.1,
        attributes: {
          interface: "Inserted into Rack 04 Switch Port 24 (Backbone Trunk)",
          payloadType: "Automated network keystroke injection & reverse shell"
        },
        boundingBox: { x: 50, y: 48, w: 8, h: 10 }
      },
      {
        id: "DET-303",
        time: "19:07:45",
        stream: "AUDIO-01",
        category: "Acoustic Event",
        label: "Mechanical Keyboard Keystroke Pattern Analysis",
        confidence: 94.3,
        attributes: {
          wpmRate: "118 WPM high-velocity terminal input",
          commandDecoded: "sudo dd if=/dev/mapper/genomic_db | nc -w 3 ...",
          keyType: "Cherry MX Blue audible tactile click switch"
        }
      }
    ],

    timeline: [
      {
        id: "TL-301",
        time: "19:05:40",
        category: "system",
        icon: "key",
        title: "Biometric Card Reader Bypass",
        source: "CAM-01 & Card Reader Log",
        confidence: 98.9,
        severity: "high",
        summary: "Subject Marcus Kane presents cloned badge ID #V-882 to Door 14A.",
        linkedEvidence: "CAM-01",
        frameIndex: 15
      },
      {
        id: "TL-302",
        time: "19:07:05",
        category: "incident",
        icon: "cpu",
        title: "Malicious Hardware Implant Attached",
        source: "CAM-01 Macro Zoom",
        confidence: 96.1,
        severity: "critical",
        summary: "Subject plugs covert USB/Ethernet hardware implant directly into core switch.",
        linkedEvidence: "CAM-01",
        frameIndex: 65
      },
      {
        id: "TL-303",
        time: "19:07:45",
        category: "audio",
        icon: "terminal",
        title: "Keystroke Acoustic Reconnaissance",
        source: "AUDIO-01 Acoustic AI",
        confidence: 94.3,
        severity: "critical",
        summary: "Acoustic keystroke model reconstructs terminal commands extracting confidential genomic files.",
        linkedEvidence: "AUDIO-01",
        frameIndex: 90
      },
      {
        id: "TL-304",
        time: "19:09:12",
        category: "movement",
        icon: "log-out",
        title: "Clean Egress via Emergency Stairwell 3",
        source: "CAM-01",
        confidence: 99.1,
        severity: "high",
        summary: "Subject disconnects console, wipes keyboard surface with microfiber cloth, and exits.",
        linkedEvidence: "CAM-01",
        frameIndex: 120
      }
    ],

    audioTranscripts: [
      {
        id: "TR-301",
        time: "19:06:15",
        speaker: "Marcus Kane (Sub-vocal phone headset)",
        text: "I'm in. Badge clone worked on Floor 14 reader without trip. Proceeding to Rack 4.",
        emotion: "calm-whisper",
        confidence: 0.98
      },
      {
        id: "TR-302",
        time: "19:07:10",
        speaker: "Marcus Kane",
        text: "Implant is online. Green link LED is pulsing. Initiating genomic database extraction dump now.",
        emotion: "whisper",
        confidence: 0.97
      },
      {
        id: "TR-303",
        time: "19:08:45",
        speaker: "Remote Handler (Audio leak through earphone)",
        text: "Exfiltration verified at 420 megabytes per second. Pull out immediately, security roving at Floor 12.",
        emotion: "urgent-whisper",
        confidence: 0.93
      }
    ],

    aiAnalysis: {
      weaponsIdentified: [
        { model: "Non-kinetic / Cyber Physical Hardware Tool", caliber: "N/A", confidence: "96.1%", triggerDiscipline: "N/A" }
      ],
      personsTracked: [
        { id: "Marcus Kane", height: "175 cm", build: "Lean", matchScore: "98.9% Facial Landmark Match" }
      ],
      crossModalDiscrepancyCheck: "Physical switch connection timestamp precisely matches remote data pipe surge logged by firewall at 19:07:08.",
      investigativeRecommendations: [
        "Issue federal warrant for Marcus Kane (DOB 1989-04-12, last known address Seattle WA).",
        "Air-gap Rack 04 Switch Port 24 immediately for forensic hardware teardown.",
        "Revoke all cryptographic certificates issued under Contractor Profile #882."
      ]
    }
  }
];
