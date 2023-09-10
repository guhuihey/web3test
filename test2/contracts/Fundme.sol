//从用户获取资金
//撤出资金
//设置最小支付金额美元
/// @title Storage相关笔记
/// @author
/// @notice immutable和constant还有function中的变量均不会使用Storage中的空间，
///正常命名的变量都会使用storage中的地址，数组只会将数组长度存储在storage中，
///然后通过哈希函数操作得到地址存储位置
///此外constant变量会直接存储在字节码中
//SPDX-License-Identifier:MIT
pragma solidity ^0.8.8;

import "./PriceConvert.sol";
import "hardhat/console.sol";
error Fundme__NotOwner();

contract Fundme {
    //命名规则:immutable变量以i_price，storage变量以s_price;
    using PriceConvert for uint256;
    uint256 private constant MINIMUMCNY = 50 * 10 ** 18;

    address[] private s_funders;
    mapping(address => uint) private s_addresstoAmountfunded;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeedAddress) {
        // console.log("now we constructing");
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(
            msg.value.GetConversionRate(s_priceFeed) >= MINIMUMCNY,
            "You need to speed more ETH"
        );
        s_funders.push(msg.sender);
        s_addresstoAmountfunded[msg.sender] = msg.value;
    }

    function Withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addresstoAmountfunded[funder] = 0;
        }

        s_funders = new address[](0); //清空数组

        //call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "call failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addresstoAmountfunded[funder] = 0;
        }

        s_funders = new address[](0); //清空数组

        //call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "call failed");
    }

    //在其他函数前面加上这个修饰器的名字在函数运行前会先进行这里面的判断
    //"_;"表是其他代码放在修饰器最前面表示修饰器最后判断，放在最后面表示修饰器最现判断
    modifier onlyOwner() {
        // require(msg.sender==owner,Notowner());
        if (msg.sender != i_owner) {
            revert Fundme__NotOwner();
        }
        _;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getAddressToAmountFunded(
        address fundingAddress
    ) public view returns (uint256) {
        return s_addresstoAmountfunded[fundingAddress];
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
