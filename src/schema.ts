import { gql } from 'apollo-server';

export const typeDefs = gql`
    type Query {
        "Query to get user by address"
        user(id: ID!): User
        venus(address: ID!): Venus
        cream: CreamFinanceProtocol @cacheControl(maxAge: 1800)
        venusProtocol: VenusProtocol
        forTubeProtocol: ForTubeProtocol
        logoURI(symbol: String!): String!
    }

    "User is a someone who hold the wallet"
    type User {
        "User's wallet address"
        id: ID!
        balances: [Currency]
    }

    interface Token {
        "Token's address"
        id: ID!
        "Token's address"
        address: String!
        "Token's name e.g. Ethereum, Pancake"
        name: String!
        "Token's symbol e.g. ETH, BNB, CAKE"
        symbol: String!
        "Token's decimal"
        decimals: Int!
        "Token's logo"
        logoURI: String
    }

    "Currency is a token that user have with can be Native or ERC20"
    type Currency implements Token {
        "Currency's address"
        id: ID!
        "Currency's address"
        address: String!
        "Currency's name e.g. Ethereum, Pancake"
        name: String!
        "Currency's symbol e.g. ETH, BNB, CAKE"
        symbol: String!
        "Currency's decimal"
        decimals: Int!
        "Currency's price per token"
        price: String
        "Amount of token that user have"
        value: String!
        "Currency's type 'ERC20'"
        tokenType: String
        "Currency's logo"
        logoURI: String
    }

    type VenusToken implements Token {
        id: ID!
        address: String!
        name: String!
        symbol: String!
        decimals: Int!
        price: String!
        "Amount of token that user have"
        suppliedAmount: String
        borrowedAmount: String
        logoURI: String
        isCollateral: Boolean
        underlyingAddress: String
        underlyingName: String
        underlyingSymbol: String
        borrowApy: String
        borrowVenusApy: String
        supplyApy: String
        supplyVenusApy: String
    }

    type Venus {
        userAddress: ID!
        totalSupplyBalance: String!
        totalBorrowBalance: String!
        vaiMintedAmount: String!
        suppliedTokens: [VenusToken!]!
        borrowedTokens: [VenusToken!]!
    }

    """
    VenusProtocol is represent data about VenusProtocol
    """
    type VenusProtocol {
        supportTokens: [VenusToken!]
    }

    type ForTubeToken implements Token {
        id: ID!
        address: String!
        name: String!
        symbol: String!
        decimals: Int!
        price: String!
        "Amount of token that user have"
        suppliedAmount: String
        borrowedAmount: String
        logoURI: String
        underlyingAddress: String
        underlyingName: String
        underlyingSymbol: String
        borrowApy: String
        supplyApy: String
    }

    type ForTube {
        userAddress: ID!
        totalSupplyBalance: String!
        totalBorrowBalance: String!
        suppliedTokens: [ForTubeToken!]!
        borrowedTokens: [ForTubeToken!]!
    }

    type ForTubeProtocol {
        supportTokens: [ForTubeToken!]
    }

    """
    Cream Token is a token in Cream Finance Protocol that will have APY for supply and borrow
    """
    type CreamToken @cacheControl(maxAge: 1800) {
        address: ID!
        name: String
        symbol: String!
        decimals: Int
        underlyingAddress: String
        underlyingName: String
        underlyingSymbol: String
        supplyRatePerBlock: String
        borrowRatePerBlock: String
        supplyApy: String @cacheControl(maxAge: 60)
        borrowApy: String @cacheControl(maxAge: 60)
        logoURI: String
    }

    """
    CreamFinanceProtocol is represent data about CreamProtocol
    """
    type CreamFinanceProtocol {
        supportTokens: [CreamToken!]
    }
`;