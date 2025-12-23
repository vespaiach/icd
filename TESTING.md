# Test Documentation

## Running Tests

This project uses Bun's built-in test runner. To run all tests:

```bash
bun test
```

To run a specific test file:

```bash
bun test src/utils.test.ts
bun test src/IconInput.test.ts
bun test src/integration.test.ts
```

To run tests in watch mode:

```bash
bun test --watch
```

## Test Structure

### Unit Tests

#### utils.test.ts
Tests for utility functions:
- `santizeFilename()` - Tests filename sanitization logic
- `loadAndParseIconInputsFromFile()` - Tests configuration file parsing and validation

#### IconInput.test.ts
Tests for the IconInput class:
- Constructor and property initialization
- URL building with various configurations
- Icon downloading (mocked)
- SVG processing for React components
- TSX content generation
- Saving icons as SVG or TSX files
- Full process workflow

### Integration Tests

#### integration.test.ts
End-to-end tests that verify the complete workflow:
- Loading configuration and downloading real icons from GitHub
- Processing multiple icons from different repositories
- Saving icons as both SVG and TSX formats
- Custom output paths
- Filename handling

**Note:** Integration tests make real network requests and have a 30-second timeout. They will gracefully skip if network is unavailable.

## Test Coverage

The test suite covers:
- ✅ Input validation and schema checking
- ✅ Filename sanitization
- ✅ URL construction for different repository configurations
- ✅ Icon downloading and error handling
- ✅ SVG to React component transformation
- ✅ File saving operations
- ✅ End-to-end workflows
- ✅ Error scenarios

## Mocking

The tests use Bun's built-in `mock()` function for:
- Network requests (fetch API)
- File system operations (in unit tests)

Integration tests use real file system operations in `/tmp` directory.

## Best Practices

1. Unit tests are fast and isolated
2. Integration tests verify real-world scenarios
3. Network failures are handled gracefully
4. Temporary files are cleaned up after tests
5. All tests are independent and can run in any order
