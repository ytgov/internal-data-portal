import axios from "axios"

jest.mock("axios", () => {
  const mockedAxios = jest.createMockFromModule('axios') as jest.Mocked<typeof axios>
  mockedAxios.create.mockReturnValue(mockedAxios)

  return {
    __esModule: true,
    default: mockedAxios,
  }
})

export const mockedAxios = jest.mocked(axios)
