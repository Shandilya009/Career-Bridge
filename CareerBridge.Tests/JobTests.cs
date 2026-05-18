using CareerBridge.Domain.Entities;
using Xunit;

namespace CareerBridge.Tests;

public class JobTests
{
    [Fact]
    public void Job_Should_Initialize_With_Active_Status()
    {
        // Arrange & Act
        var job = new Job();

        // Assert
        Assert.True(job.IsActive);
        Assert.NotNull(job.EligibilityCriteria);
    }
}
