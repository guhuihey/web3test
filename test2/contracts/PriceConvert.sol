//SPXD-License-Identifier:MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConvert {
    function GetPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    // function Getversion() internal view returns(uint256){
    // AggregatorV3Interface priceFeed=AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    // return priceFeed.version();
    //  }
    function GetConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethprice = GetPrice(priceFeed);
        uint256 ethAmountInCn = (ethprice * ethAmount) / 1e18;
        return ethAmountInCn;
    }
}
