export const abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "string",
                "name": "eventCode",
                "type": "string"
            }
        ],
        "name": "EventClosed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "string",
                "name": "eventCode",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "creator",
                "type": "address"
            }
        ],
        "name": "EventCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "string",
                "name": "eventCode",
                "type": "string"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "participant",
                "type": "address"
            }
        ],
        "name": "Participated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "code",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "addParticipant",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "name": "checkUpkeep",
        "outputs": [
            {
                "internalType": "bool",
                "name": "upkeepNeeded",
                "type": "bool"
            },
            {
                "internalType": "bytes",
                "name": "performData",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "code",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "string[]",
                "name": "hashtags",
                "type": "string[]"
            },
            {
                "internalType": "uint256",
                "name": "durationSeconds",
                "type": "uint256"
            }
        ],
        "name": "createEvent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "code",
                "type": "string"
            }
        ],
        "name": "getEvent",
        "outputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "string[]",
                "name": "hashtags",
                "type": "string[]"
            },
            {
                "internalType": "address",
                "name": "creator",
                "type": "address"
            },
            {
                "internalType": "address[]",
                "name": "participants",
                "type": "address[]"
            },
            {
                "internalType": "uint256",
                "name": "startTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "duration",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "closed",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "code",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "hasParticipated",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "performData",
                "type": "bytes"
            }
        ],
        "name": "performUpkeep",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;