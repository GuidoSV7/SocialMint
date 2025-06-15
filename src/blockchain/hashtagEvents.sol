// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

contract HashtagEvent is AutomationCompatibleInterface {
    struct Event {
        string poapId;
        string name;
        string[] hashtags;
        address creator;
        address[] participants;
        mapping(address => bool) hasParticipated;
        uint256 startTime; // timestamp inicio
        uint256 duration; // duración en segundos
        bool closed; // si ya se cerró el evento
    }

    mapping(string => Event) private events;
    mapping(string => bool) private eventExists;
    string[] private eventCodes; // para iterar en checkUpkeep

    event EventCreated(string indexed eventCode, string name, address creator);
    event Participated(string indexed eventCode, address indexed participant);
    event EventClosed(string indexed eventCode); // evento que indica que se cerró

    modifier onlyCreator(string memory eventCode) {
        require(msg.sender == events[eventCode].creator, "Not the creator");
        _;
    }

    function _normalize(
        string memory str
    ) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        for (uint256 i = 0; i < bStr.length; i++) {
            if (bStr[i] >= 0x41 && bStr[i] <= 0x5A) {
                bStr[i] = bytes1(uint8(bStr[i]) + 32);
            }
        }
        return string(bStr);
    }

    function createEvent(
        string memory code,
        string memory name,
        string[] memory hashtags,
        uint256 durationSeconds,
        string memory poapId
    ) public {
        string memory eventCode = _normalize(code);
        require(!eventExists[eventCode], "Event code already exists");

        Event storage e = events[eventCode];
        e.name = name;
        e.hashtags = hashtags;
        e.creator = msg.sender;
        e.startTime = block.timestamp;
        e.duration = durationSeconds;
        e.closed = false;
        e.poapId = poapId;
        eventExists[eventCode] = true;
        eventCodes.push(eventCode);

        emit EventCreated(eventCode, name, msg.sender);
    }

    function addParticipant(string memory code) public {
        string memory eventCode = _normalize(code);
        Event storage e = events[eventCode];
        if (!e.hasParticipated[msg.sender]) {
            e.hasParticipated[msg.sender] = true;
            e.participants.push(msg.sender);
            emit Participated(eventCode, msg.sender);
        }
    }

    // Chainlink Keeper function to check if upkeep is needed
    function checkUpkeep(
        bytes calldata
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Busca eventos que hayan terminado y no estén cerrados
        for (uint256 i = 0; i < eventCodes.length; i++) {
            string memory code = eventCodes[i];
            Event storage e = events[code];
            if (!e.closed && block.timestamp >= e.startTime + e.duration) {
                upkeepNeeded = true;
                performData = bytes(code); // pasamos el código para el performUpkeep
                return (upkeepNeeded, performData);
            }
        }
        upkeepNeeded = false;
        performData = bytes("");
    }

    // Chainlink Keeper function que se ejecuta si checkUpkeep devuelve true
    function performUpkeep(bytes calldata performData) external override {
        string memory code = string(performData);
        require(eventExists[code], "Event does not exist");

        Event storage e = events[code];
        require(!e.closed, "Event already closed");
        require(
            block.timestamp >= e.startTime + e.duration,
            "Event duration not reached"
        );

        e.closed = true;

        // eventClosed Event
        emit EventClosed(code);
    }

    function getEvent(
        string memory code
    )
        public
        view
        returns (
            string memory poapId,
            string memory name,
            string[] memory hashtags,
            address creator,
            address[] memory participants,
            uint256 startTime,
            uint256 duration,
            bool closed,
            uint256 registeredAddressNumber
        )
    {
        string memory eventCode = _normalize(code);
        Event storage e = events[eventCode];
        return (
            e.poapId,
            e.name,
            e.hashtags,
            e.creator,
            e.participants,
            e.startTime,
            e.duration,
            e.closed,
            e.participants.length
        );
    }

    function hasParticipated(
        string memory code,
        address user
    ) public view returns (bool) {
        string memory eventCode = _normalize(code);
        return events[eventCode].hasParticipated[user];
    }

    function totalEvents() public view returns (uint256) {
        return eventCodes.length;
    }

    function getEventsPaginated(
        uint256 start,
        uint256 count
    )
        public
        view
        returns (
            string[] memory codes,
            string[] memory names,
            address[] memory creators,
            uint256[] memory startTimes,
            uint256[] memory durations,
            bool[] memory closedStatuses,
            string[] memory poapIds,
            string[][] memory hashtags,
            uint256[] memory participantCounts
        )
    {
        uint256 total = eventCodes.length;
        require(start < total, "Start index out of range");

        uint256 end = start + count;
        if (end > total) {
            end = total;
        }

        uint256 len = end - start;

        // Inicializamos los arrays de salida
        codes = new string[](len);
        names = new string[](len);
        creators = new address[](len);
        startTimes = new uint256[](len);
        durations = new uint256[](len);
        closedStatuses = new bool[](len);
        poapIds = new string[](len);
        hashtags = new string[][](len);
        participantCounts = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            string memory code = eventCodes[start + i];
            Event storage e = events[code];

            codes[i] = code;
            names[i] = e.name;
            creators[i] = e.creator;
            startTimes[i] = e.startTime;
            durations[i] = e.duration;
            closedStatuses[i] = e.closed;
            poapIds[i] = e.poapId;
            hashtags[i] = e.hashtags;
            participantCounts[i] = e.participants.length;
        }
        return (
            codes,
            names,
            creators,
            startTimes,
            durations,
            closedStatuses,
            poapIds,
            hashtags,
            participantCounts
        );
    }
}
