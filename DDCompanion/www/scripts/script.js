}<<<<<<< .mine
            // Only show beacons that are updated during the last 60 seconds.
            if (beacon.timeStamp + 60000 > timeNow) {
                // Map the RSSI value to a width in percent for the indicator.
                var rssiWidth = 1; // Used when RSSI is zero or greater.
                if (beacon.rssi < -100) { rssiWidth = 100; }
                else if (beacon.rssi < 0) { rssiWidth = 100 + beacon.rssi; }
            }
        });
    }
}
=======










>>>>>>> .theirs
